import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth, isProfileComplete } from "../context/AuthContext";
import type { Role } from "../lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  /** Set to true for routes that are meant to complete the profile (e.g. /onboarding) */
  allowIncompleteProfile?: boolean;
}

export function ProtectedRoute({ children, allowedRoles, allowIncompleteProfile = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    // Not authenticated → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // Profile missing or incomplete → onboarding (skip if this IS the onboarding route)
    if (!allowIncompleteProfile && (!profile || !isProfileComplete(profile))) {
      navigate("/onboarding", { replace: true });
      return;
    }

    // Role-based redirect (only enforce when profile is complete)
    if (allowedRoles && profile && isProfileComplete(profile)) {
      if (!allowedRoles.includes(profile.role)) {
        if (profile.role === "admin") navigate("/admin", { replace: true });
        else if (profile.role === "coordinator") navigate("/coordinator", { replace: true });
        else navigate("/dashboard", { replace: true });
      }
    }
  }, [user, profile, loading, navigate, allowedRoles, allowIncompleteProfile]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#FDFAF4" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: "#9B1B2E", borderTopColor: "transparent" }}
          />
          <p
            className="text-[#6B5E59]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Loading…
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (!allowIncompleteProfile && (!profile || !isProfileComplete(profile))) return null;
  if (allowedRoles && profile && isProfileComplete(profile) && !allowedRoles.includes(profile.role)) return null;

  return <>{children}</>;
}

