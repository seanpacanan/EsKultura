import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { api, Profile } from "../lib/api";

interface SignInResult {
  profile?: Profile;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (accessToken: string): Promise<Profile | null> => {
    try {
      const profileData = await api.getProfile(accessToken);
      setProfile(profileData);
      return profileData;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    // Supabase v2 fires INITIAL_SESSION on mount via onAuthStateChange,
    // so we use it as the single source of truth to avoid race conditions.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        await fetchProfile(session.access_token);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error: error.message };

      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        const profileData = await fetchProfile(data.session.access_token);
        return { profile: profileData ?? undefined };
      }

      return { error: "Login failed — no session returned" };
    } catch (err) {
      return { error: "An unexpected error occurred during sign in" };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      await fetchProfile(session.access_token);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, session, loading, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function isProfileComplete(profile: Profile | null): boolean {
  return !!(profile?.full_name && profile?.unit);
}

export function getRedirectPath(profile: Profile | null): string {
  // If auth succeeded but profile could not be fetched yet (transient API/network),
  // avoid redirecting back to login and continue to onboarding flow.
  if (!profile) return "/onboarding";
  if (!isProfileComplete(profile)) return "/onboarding";
  if (profile.role === "admin") return "/admin";
  if (profile.role === "coordinator") return "/coordinator";
  return "/dashboard";
}
