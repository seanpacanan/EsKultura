import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = "admin" | "coordinator" | "viewer";
type Unit = "Himig" | "Teatro" | "Katha" | "Ritmo" | "Likha";
type ProfileStatus = "active" | "inactive" | "pending";
type MembershipStatus = "pending" | "approved" | "rejected";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  unit: Unit | null;
  role: Role;
  status: ProfileStatus;
  created_at: string;
}

interface MembershipRequest {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  unit: Unit;
  status: MembershipStatus;
  created_at: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  unit: Unit | null;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const VALID_UNITS: Unit[] = ["Himig", "Teatro", "Katha", "Ritmo", "Likha"];
const VALID_ROLES: Role[] = ["admin", "coordinator", "viewer"];

// ─── Supabase client (service role) ──────────────────────────────────────────
const getServiceClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function getAuthUser(authHeader: string | null | undefined) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  try {
    const supabase = getServiceClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

// ─── DB helpers ──────────────────────────────────────────────────────────────
async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Profile | null;
}

async function getAllProfiles(): Promise<Profile[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Profile[];
}

async function getUnitProfiles(unit: string): Promise<Profile[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("unit", unit)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Profile[];
}

async function upsertProfile(profile: Profile): Promise<Profile> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

async function updateProfileFields(
  userId: string,
  fields: Partial<Pick<Profile, "full_name" | "unit" | "role" | "status">>
): Promise<Profile> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Profile;
}

async function getMembershipRequest(id: string): Promise<MembershipRequest | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("membership_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as MembershipRequest | null;
}

async function getAllMembershipRequests(): Promise<MembershipRequest[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("membership_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as MembershipRequest[];
}

async function createMembershipRequest(request: Omit<MembershipRequest, "created_at">): Promise<MembershipRequest> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("membership_requests")
    .insert(request)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as MembershipRequest;
}

async function updateMembershipRequestStatus(
  id: string,
  status: MembershipStatus
): Promise<MembershipRequest> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("membership_requests")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as MembershipRequest;
}

async function getAnnouncement(id: string): Promise<Announcement | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Announcement | null;
}

async function getAllAnnouncements(): Promise<Announcement[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Announcement[];
}

async function createAnnouncement(announcement: Omit<Announcement, "created_at">): Promise<Announcement> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert(announcement)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Announcement;
}

async function updateAnnouncement(
  id: string,
  fields: Pick<Announcement, "title" | "content"> & { updated_at: string }
): Promise<Announcement> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("announcements")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Announcement;
}

async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

const app = new Hono().basePath("/eskultura");

app.use("/*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: [
      "https://es-kultura.vercel.app",
      "https://nqpjoquopcbvhrolwirg.supabase.co",
      "http://localhost:5173",
      "http://localhost:4173",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/health", (c) =>
  c.json({ status: "ok", service: "Eskultura Backend" })
);

// ─── AUTH: Signup ─────────────────────────────────────────────────────────────
app.post("/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, full_name } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    const supabase = getServiceClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: full_name || null },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log("Signup error:", error.message);
      return c.json({ error: error.message }, 400);
    }

    const user = data.user;
    if (!user) return c.json({ error: "User creation failed" }, 500);

    // Create profile in DB with default viewer role
    const profile: Profile = {
      id: user.id,
      email: user.email || "",
      full_name: full_name || null,
      unit: null,
      role: "viewer",
      status: "inactive",
      created_at: new Date().toISOString(),
    };

    await upsertProfile(profile);
    console.log(`Profile created for user ${user.id} with role=viewer`);

    return c.json({ success: true, message: "Account created successfully" });
  } catch (err) {
    console.log("Signup error:", err);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// ─── AUTH: Make First Admin (one-time bootstrap only) ────────────────────────
app.post("/auth/make-first-admin", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    // Check if any admin already exists
    const allProfiles = await getAllProfiles();
    const existingAdmin = allProfiles.find((p) => p.role === "admin");

    if (existingAdmin) {
      return c.json(
        { error: "System already has an admin. This endpoint is locked." },
        400
      );
    }

    // Promote current user to admin
    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    const updated = await updateProfileFields(user.id, { role: "admin", status: "active" });

    console.log(`User ${user.id} became the first admin`);
    return c.json({ success: true, profile: updated });
  } catch (err) {
    console.log("Make first admin error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── PROFILE: Get Own ─────────────────────────────────────────────────────────
app.get("/profile", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    let profile = await getProfile(user.id);

    // Auto-create profile if missing (edge case for OAuth or direct signups)
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || null,
        unit: null,
        role: "viewer",
        status: "inactive",
        created_at: new Date().toISOString(),
      };
      profile = await upsertProfile(profile);
    }

    return c.json(profile);
  } catch (err) {
    console.log("Get profile error:", err);
    return c.json({ error: "Internal server error fetching profile" }, 500);
  }
});

// ─── PROFILE: Update Own (full_name and unit ONLY) ───────────────────────────
app.put("/profile", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.json();
    const { full_name, unit } = body;

    if (unit && !VALID_UNITS.includes(unit)) {
      return c.json(
        { error: `Invalid unit. Must be one of: ${VALID_UNITS.join(", ")}` },
        400
      );
    }

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    // SECURITY: Only allow updating full_name and unit — role is NEVER set here
    const fields: Partial<Pick<Profile, "full_name" | "unit" | "status">> = {
      full_name: full_name !== undefined ? full_name : profile.full_name,
      unit: unit !== undefined ? (unit as Unit) : profile.unit,
    };

    // Auto-set status to pending when profile becomes complete
    if (fields.full_name && fields.unit && profile.status === "inactive") {
      fields.status = "pending";
    }

    const updated = await updateProfileFields(user.id, fields);
    return c.json(updated);
  } catch (err) {
    console.log("Update profile error:", err);
    return c.json({ error: "Internal server error updating profile" }, 500);
  }
});

// ─── PROFILES: Get All (admin only) ──────────────────────────────────────────
app.get("/profiles", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const profiles = await getAllProfiles();
    return c.json(profiles);
  } catch (err) {
    console.log("Get profiles error:", err);
    return c.json({ error: "Internal server error fetching profiles" }, 500);
  }
});

// ─── PROFILES: Get by Unit (admin or coordinator of that unit) ────────────────
app.get("/profiles/unit/:unit", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const unit = c.req.param("unit") as Unit;
    if (!VALID_UNITS.includes(unit)) {
      return c.json({ error: "Invalid unit" }, 400);
    }

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    const isAdmin = profile.role === "admin";
    const isCoordinatorOfUnit =
      profile.role === "coordinator" && profile.unit === unit;

    if (!isAdmin && !isCoordinatorOfUnit) {
      return c.json(
        { error: "Forbidden: You can only view members of your assigned unit" },
        403
      );
    }

    const unitProfiles = await getUnitProfiles(unit);
    return c.json(unitProfiles);
  } catch (err) {
    console.log("Get unit profiles error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── PROFILES: Update Role (admin only) ──────────────────────────────────────
app.put("/profiles/:userId/role", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await getProfile(user.id);
    if (!adminProfile || adminProfile.role !== "admin") {
      return c.json(
        { error: "Forbidden: Only admins can assign roles" },
        403
      );
    }

    const userId = c.req.param("userId");
    const body = await c.req.json();
    const { role } = body as { role: Role };

    if (!VALID_ROLES.includes(role)) {
      return c.json(
        { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
        400
      );
    }

    // Prevent self-demotion
    if (userId === user.id && role !== "admin") {
      return c.json({ error: "Cannot demote your own admin role" }, 400);
    }

    const targetProfile = await getProfile(userId);
    if (!targetProfile) return c.json({ error: "User not found" }, 404);

    const updated = await updateProfileFields(userId, { role });
    console.log(`Admin ${user.id} changed role of ${userId} to ${role}`);
    return c.json(updated);
  } catch (err) {
    console.log("Update role error:", err);
    return c.json({ error: "Internal server error updating role" }, 500);
  }
});

// ─── PROFILES: Update Status (admin only) ────────────────────────────────────
app.put("/profiles/:userId/status", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const adminProfile = await getProfile(user.id);
    if (!adminProfile || adminProfile.role !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    const userId = c.req.param("userId");
    const { status } = await c.req.json();

    if (!["active", "inactive", "pending"].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const targetProfile = await getProfile(userId);
    if (!targetProfile) return c.json({ error: "User not found" }, 404);

    const updated = await updateProfileFields(userId, { status });
    return c.json(updated);
  } catch (err) {
    console.log("Update status error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── MEMBERSHIP: Create Request ────────────────────────────────────────────────
app.post("/membership-requests", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    const body = await c.req.json();
    const { unit } = body as { unit: Unit };

    if (!VALID_UNITS.includes(unit)) {
      return c.json({ error: "Invalid unit" }, 400);
    }

    // Check for existing pending request
    const allRequests = await getAllMembershipRequests();
    const existing = allRequests.find(
      (r) => r.user_id === user.id && r.unit === unit && r.status === "pending"
    );
    if (existing) {
      return c.json(
        { error: "You already have a pending request for this unit" },
        400
      );
    }

    const requestId = crypto.randomUUID();
    const request = await createMembershipRequest({
      id: requestId,
      user_id: user.id,
      user_name: profile.full_name || undefined,
      user_email: profile.email,
      unit,
      status: "pending",
    });

    console.log(`Membership request ${requestId} created — user=${user.id} unit=${unit}`);
    return c.json(request, 201);
  } catch (err) {
    console.log("Create membership request error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── MEMBERSHIP: Get Requests (role-filtered) ─────────────────────────────────
app.get("/membership-requests", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    const allRequests = await getAllMembershipRequests();

    let filtered: MembershipRequest[];
    if (profile.role === "admin") {
      filtered = allRequests;
    } else if (profile.role === "coordinator") {
      filtered = allRequests.filter((r) => r.unit === profile.unit);
    } else {
      filtered = allRequests.filter((r) => r.user_id === user.id);
    }

    return c.json(filtered);
  } catch (err) {
    console.log("Get membership requests error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── MEMBERSHIP: Approve or Reject ────────────────────────────────────────────
app.put("/membership-requests/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    if (profile.role === "viewer") {
      return c.json(
        { error: "Forbidden: Coordinator or Admin access required" },
        403
      );
    }

    const requestId = c.req.param("id");
    const request = await getMembershipRequest(requestId);
    if (!request) return c.json({ error: "Membership request not found" }, 404);

    // Coordinator can only manage their own unit
    if (profile.role === "coordinator" && request.unit !== profile.unit) {
      return c.json(
        {
          error:
            "Forbidden: Can only manage membership requests for your assigned unit",
        },
        403
      );
    }

    const body = await c.req.json();
    const { status } = body as { status: "approved" | "rejected" };

    if (!["approved", "rejected"].includes(status)) {
      return c.json({ error: 'Status must be "approved" or "rejected"' }, 400);
    }

    const updated = await updateMembershipRequestStatus(requestId, status);

    // On approval → update requesting user's profile status to active
    if (status === "approved") {
      await updateProfileFields(request.user_id, { status: "active", unit: request.unit });
      console.log(
        `User ${request.user_id} approved as active member of ${request.unit}`
      );
    }

    return c.json(updated);
  } catch (err) {
    console.log("Update membership request error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── ANNOUNCEMENTS: Get (role-filtered) ──────────────────────────────────────
app.get("/announcements", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    const allAnnouncements = await getAllAnnouncements();

    let filtered: Announcement[];
    if (profile.role === "admin") {
      filtered = allAnnouncements;
    } else {
      filtered = allAnnouncements.filter(
        (a) => a.unit === null || a.unit === profile.unit
      );
    }

    return c.json(filtered);
  } catch (err) {
    console.log("Get announcements error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── ANNOUNCEMENTS: Create ────────────────────────────────────────────────────
app.post("/announcements", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    if (profile.role === "viewer") {
      return c.json(
        { error: "Forbidden: Coordinator or Admin access required" },
        403
      );
    }

    const body = await c.req.json();
    const { title, content, unit } = body;

    if (!title?.trim() || !content?.trim()) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    if (unit && !VALID_UNITS.includes(unit)) {
      return c.json({ error: "Invalid unit" }, 400);
    }

    // SECURITY: Coordinators are restricted to their own unit
    let announcementUnit: Unit | null = unit || null;
    if (profile.role === "coordinator") {
      announcementUnit = profile.unit;
    }

    const id = crypto.randomUUID();
    const announcement = await createAnnouncement({
      id,
      title: title.trim(),
      content: content.trim(),
      unit: announcementUnit,
      created_by: user.id,
      created_by_name: profile.full_name || profile.email,
    });

    console.log(`Announcement ${id} created by ${user.id} (${profile.role})`);
    return c.json(announcement, 201);
  } catch (err) {
    console.log("Create announcement error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── ANNOUNCEMENTS: Update ────────────────────────────────────────────────────
app.put("/announcements/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    if (profile.role === "viewer") {
      return c.json({ error: "Forbidden: Coordinator or Admin required" }, 403);
    }

    const id = c.req.param("id");
    const announcement = await getAnnouncement(id);
    if (!announcement) return c.json({ error: "Announcement not found" }, 404);

    // Coordinator can only edit their unit's announcements
    if (
      profile.role === "coordinator" &&
      announcement.unit !== profile.unit
    ) {
      return c.json(
        { error: "Forbidden: Can only edit announcements for your unit" },
        403
      );
    }

    const { title, content } = await c.req.json();
    if (!title?.trim() || !content?.trim()) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const updated = await updateAnnouncement(id, {
      title: title.trim(),
      content: content.trim(),
      updated_at: new Date().toISOString(),
    });
    return c.json(updated);
  } catch (err) {
    console.log("Update announcement error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ─── ANNOUNCEMENTS: Delete ────────────────────────────────────────────────────
app.delete("/announcements/:id", async (c) => {
  try {
    const user = await getAuthUser(c.req.header("Authorization"));
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const profile = await getProfile(user.id);
    if (!profile) return c.json({ error: "Profile not found" }, 404);

    if (profile.role === "viewer") {
      return c.json({ error: "Forbidden: Coordinator or Admin required" }, 403);
    }

    const id = c.req.param("id");
    const announcement = await getAnnouncement(id);
    if (!announcement) return c.json({ error: "Announcement not found" }, 404);

    // Coordinator can only delete their unit's announcements
    if (
      profile.role === "coordinator" &&
      announcement.unit !== profile.unit
    ) {
      return c.json(
        { error: "Forbidden: Can only delete announcements for your unit" },
        403
      );
    }

    await deleteAnnouncement(id);
    console.log(`Announcement ${id} deleted by ${user.id}`);
    return c.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    console.log("Delete announcement error:", err);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);
