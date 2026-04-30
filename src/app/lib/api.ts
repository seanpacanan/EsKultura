import { projectId, publicAnonKey } from "/utils/supabase/info";

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/eskultura`;

// ─── Types (mirrored from server) ─────────────────────────────────────────────
export type Role = "admin" | "coordinator" | "viewer";
export type Unit = "Himig" | "Teatro" | "Katha" | "Ritmo" | "Likha";
export type ProfileStatus = "active" | "inactive" | "pending";
export type MembershipStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  unit: Unit | null;
  role: Role;
  status: ProfileStatus;
  created_at: string;
}

export interface MembershipRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  unit: Unit;
  status: MembershipStatus;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  unit: Unit | null;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

// ─── Core request helper ──────────────────────────────────────────────────────
async function request<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const hasBody = options.method === "POST" || options.method === "PUT";
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${token || publicAnonKey}`,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.message || "Request failed");
  }

  // Handle 204 or empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const api = {
  signup: (data: { email: string; password: string; full_name?: string }) =>
    request<{ success: boolean; message: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  makeFirstAdmin: (token: string) =>
    request<{ success: boolean; profile: Profile }>("/auth/make-first-admin", {
      method: "POST",
    }, token),

  // ─── Profile ───────────────────────────────────────────────────────────────
  getProfile: (token: string) =>
    request<Profile>("/profile", {}, token),

  updateProfile: (
    data: { full_name?: string; unit?: string },
    token: string
  ) =>
    request<Profile>("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  // ─── Profiles (admin / coordinator) ────────────────────────────────────────
  getAllProfiles: (token: string) =>
    request<Profile[]>("/profiles", {}, token),

  getUnitProfiles: (unit: string, token: string) =>
    request<Profile[]>(`/profiles/unit/${unit}`, {}, token),

  updateUserRole: (userId: string, role: Role, token: string) =>
    request<Profile>(`/profiles/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }, token),

  updateUserStatus: (userId: string, status: ProfileStatus, token: string) =>
    request<Profile>(`/profiles/${userId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }, token),

  // ─── Membership Requests ───────────────────────────────────────────────────
  getMembershipRequests: (token: string) =>
    request<MembershipRequest[]>("/membership-requests", {}, token),

  createMembershipRequest: (unit: string, token: string) =>
    request<MembershipRequest>("/membership-requests", {
      method: "POST",
      body: JSON.stringify({ unit }),
    }, token),

  updateMembershipRequest: (
    id: string,
    status: "approved" | "rejected",
    token: string
  ) =>
    request<MembershipRequest>(`/membership-requests/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }, token),

  // ─── Announcements ─────────────────────────────────────────────────────────
  getAnnouncements: (token: string) =>
    request<Announcement[]>("/announcements", {}, token),

  createAnnouncement: (
    data: { title: string; content: string; unit?: string | null },
    token: string
  ) =>
    request<Announcement>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  updateAnnouncement: (
    id: string,
    data: { title: string; content: string },
    token: string
  ) =>
    request<Announcement>(`/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  deleteAnnouncement: (id: string, token: string) =>
    request<{ success: boolean }>(`/announcements/${id}`, {
      method: "DELETE",
    }, token),
};
