import { useEffect, useRef, useState } from "react";
import {
  Bell, BookOpen, Clock, CheckCircle2, XCircle, Loader2, Send,
  RefreshCw, User, Edit3, Save, X, Upload, GraduationCap,
  Hash, Info, Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { api, Announcement, MembershipRequest } from "../lib/api";
import { AppHeader } from "../components/AppHeader";
import { toast } from "sonner";

const unitColors: Record<string, string> = {
  Himig: "#9B1B2E", Teatro: "#7D1525", Katha: "#C8962C", Ritmo: "#E0703A", Likha: "#8B6E52",
};

const statusIcon = {
  pending: <Clock size={14} className="text-amber-600" />,
  approved: <CheckCircle2 size={14} className="text-green-600" />,
  rejected: <XCircle size={14} className="text-red-600" />,
};

const statusBadge = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function Dashboard() {
  return <DashboardContent />;
}

function DashboardContent() {
  const { profile, session, refreshProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [activeTab, setActiveTab] = useState<"feed" | "profile">("feed");

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editCourse, setEditCourse] = useState("");
  const [editStudentNumber, setEditStudentNumber] = useState("");
  const [editUnitInfo, setEditUnitInfo] = useState("");
  const [editExperienceAwards, setEditExperienceAwards] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    if (!session?.access_token) return;
    setLoadingData(true);
    try {
      const [ann, reqs] = await Promise.all([
        api.getAnnouncements(session.access_token),
        api.getMembershipRequests(session.access_token),
      ]);
      setAnnouncements(ann);
      setRequests(reqs);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
    setLoadingData(false);
  };

  useEffect(() => { fetchData(); }, [session?.access_token]);

  // Sync avatar preview whenever profile changes
  useEffect(() => {
    setAvatarPreview(profile?.avatar_url || null);
  }, [profile?.avatar_url]);

  const startEditing = () => {
    setEditFullName(profile?.full_name || "");
    setEditCourse(profile?.course || "");
    setEditStudentNumber(profile?.student_number || "");
    setEditUnitInfo(profile?.unit_info || "");
    setEditExperienceAwards(profile?.experience_awards || "");
    setAvatarFile(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar_url || null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!session?.access_token) return;
    setSavingProfile(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const { avatar_url } = await api.uploadAvatar(avatarFile, session.access_token);
        avatarUrl = avatar_url;
      }
      await api.updateProfile({
        full_name: editFullName.trim() || undefined,
        course: editCourse.trim() || undefined,
        student_number: editStudentNumber.trim() || undefined,
        unit_info: editUnitInfo.trim() || undefined,
        experience_awards: editExperienceAwards.trim() || undefined,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      }, session.access_token);
      await refreshProfile();
      toast.success("Profile updated!");
      setEditing(false);
      setAvatarFile(null);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    }
    setSavingProfile(false);
  };

  const pendingRequest = requests.find((r) => r.status === "pending");
  const approvedRequest = requests.find((r) => r.status === "approved");
  const latestRequest = approvedRequest || pendingRequest || requests[0];

  const submitRequest = async () => {
    if (!profile?.unit || !session?.access_token) return;
    setSubmittingRequest(true);
    try {
      await api.createMembershipRequest(profile.unit, session.access_token);
      toast.success("Membership request submitted!");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    }
    setSubmittingRequest(false);
  };

  const unitColor = profile?.unit ? unitColors[profile.unit] : "#9B1B2E";
  const initials = profile?.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const displayAvatar = avatarPreview || profile?.avatar_url;

  return (
    <div className="min-h-screen" style={{ background: "#FDFAF4", fontFamily: "'Inter', sans-serif" }}>
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl overflow-hidden mb-8"
          style={{ background: "linear-gradient(135deg, #9B1B2E, #5C0F1C)", boxShadow: "0 10px 40px -10px rgba(155,27,46,0.4)" }}
        >
          <div className="px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar in banner */}
              <div
                className="w-14 h-14 rounded-2xl flex-shrink-0 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.3)" }}
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ fontFamily: "'Inter', serif" }}>
                    {initials}
                  </div>
                )}
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome back,</p>
                <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Inter', serif" }}>
                  {profile?.full_name || "Artist"}!
                </h2>
                {profile?.course && <p className="text-white/60 text-xs mt-0.5">{profile.course}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.unit && (
                <span className="px-3 py-1.5 rounded-full text-white text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  {profile.unit}
                </span>
              )}
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ background: "#C8962C", color: "white" }}>
                {profile?.status === "active" ? "✓ Active Member" : profile?.status === "pending" ? "⏳ Pending" : "Member"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-[#F0E8E0] w-fit" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {(["feed", "profile"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize"
              style={{
                background: activeTab === tab ? "#9B1B2E" : "transparent",
                color: activeTab === tab ? "white" : "#6B5E59",
              }}
            >
              {tab === "feed" ? "Announcements" : "My Profile"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Feed Tab ── */}
          {activeTab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Announcements */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 font-bold text-[#1A1210]" style={{ fontFamily: "'Inter', serif", fontSize: "1.2rem" }}>
                      <Bell size={18} className="text-[#9B1B2E]" /> Announcements
                    </h3>
                    <button onClick={fetchData} className="text-[#6B5E59] hover:text-[#9B1B2E] transition-colors p-1.5 rounded-lg hover:bg-[#9B1B2E]/5">
                      <RefreshCw size={15} />
                    </button>
                  </div>

                  {loadingData ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={24} className="animate-spin text-[#9B1B2E]" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#E8DDD5] p-12 text-center">
                      <BookOpen size={32} className="mx-auto mb-3 text-[#C8962C]/40" />
                      <p className="text-[#6B5E59]" style={{ fontWeight: 500 }}>No announcements yet</p>
                      <p className="text-[#6B5E59]/60 text-sm mt-1">Check back later for updates from your unit coordinator.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {announcements.map((ann, i) => (
                        <motion.div key={ann.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-xl p-5 bg-white border border-[#F0E8E0]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-bold text-[#1A1210]" style={{ fontFamily: "'Inter', serif", fontSize: "1rem" }}>{ann.title}</h4>
                            {ann.unit ? (
                              <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-white text-xs font-semibold" style={{ background: unitColors[ann.unit] || "#9B1B2E" }}>{ann.unit}</span>
                            ) : (
                              <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: "#F0E8E0", color: "#8B6E52" }}>Global</span>
                            )}
                          </div>
                          <p className="text-[#6B5E59] text-sm leading-relaxed">{ann.content}</p>
                          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F0E8E0]">
                            <span className="text-[#6B5E59]/60 text-xs">{formatDate(ann.created_at)}</span>
                            {ann.created_by_name && <span className="text-[#6B5E59]/60 text-xs">by {ann.created_by_name}</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-5">
                  <div className="rounded-2xl bg-white p-5 border border-[#F0E8E0]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                    <h3 className="font-bold text-[#1A1210] mb-4" style={{ fontFamily: "'Inter', serif", fontSize: "1.05rem" }}>Membership Status</h3>
                    {latestRequest ? (
                      <div className="flex flex-col gap-3">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${statusBadge[latestRequest.status]}`}>
                          {statusIcon[latestRequest.status]}
                          <span className="capitalize">{latestRequest.status}</span>
                        </div>
                        <div className="text-sm text-[#6B5E59]">
                          <p><span className="font-medium">Unit:</span> {latestRequest.unit}</p>
                          <p className="mt-1"><span className="font-medium">Applied:</span> {formatDate(latestRequest.created_at)}</p>
                        </div>
                        {latestRequest.status === "pending" && (
                          <p className="text-xs text-[#6B5E59]/70 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">Your request is awaiting review by the unit coordinator.</p>
                        )}
                        {latestRequest.status === "approved" && (
                          <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-100">🎉 You are an active member of {latestRequest.unit}!</p>
                        )}
                        {latestRequest.status === "rejected" && profile?.unit && (
                          <button onClick={submitRequest} disabled={submittingRequest}
                            className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-white text-sm font-medium"
                            style={{ background: "#9B1B2E" }}>
                            <Send size={13} /> Reapply
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <p className="text-sm text-[#6B5E59]">No membership request yet.</p>
                        {profile?.unit && (
                          <button onClick={submitRequest} disabled={submittingRequest}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}>
                            {submittingRequest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Apply to {profile.unit}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {profile?.unit && (
                    <div className="rounded-2xl p-5 text-white relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${unitColor}, ${unitColor}CC)`, boxShadow: `0 8px 24px -4px ${unitColor}50` }}>
                      <div className="relative z-10">
                        <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">Your Unit</p>
                        <h3 style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.5rem" }}>{profile.unit}</h3>
                        <p className="text-white/70 text-sm mt-1">
                          {profile.unit === "Himig" && "Music & Vocal Performance"}
                          {profile.unit === "Teatro" && "Acting & Stage Performance"}
                          {profile.unit === "Katha" && "Writing & Storytelling"}
                          {profile.unit === "Ritmo" && "Dance & Movement"}
                          {profile.unit === "Likha" && "Visual Arts & Design"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Profile Tab ── */}
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="max-w-2xl">
                <div className="rounded-2xl bg-white border border-[#F0E8E0] overflow-hidden" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  {/* Profile header bar */}
                  <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${unitColor}, #C8962C, #E0703A)` }} />

                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <h3 className="font-bold text-[#1A1210]" style={{ fontFamily: "'Inter', serif", fontSize: "1.3rem" }}>My Profile</h3>
                      {!editing ? (
                        <button onClick={startEditing}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-[#9B1B2E] border border-[#9B1B2E]/30 hover:bg-[#9B1B2E]/5 transition-all">
                          <Edit3 size={14} /> Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button onClick={cancelEditing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#6B5E59] border border-[#E8DDD5] hover:bg-[#F5EEE8] transition-all">
                            <X size={14} /> Cancel
                          </button>
                          <button onClick={saveProfile} disabled={savingProfile}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
                            style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}>
                            {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                      <div className="relative flex-shrink-0">
                        <div
                          className={`w-28 h-28 rounded-2xl overflow-hidden border-4 ${editing ? "cursor-pointer group" : ""}`}
                          style={{ borderColor: `${unitColor}30`, boxShadow: `0 8px 24px -4px ${unitColor}30` }}
                          onClick={() => editing && fileInputRef.current?.click()}
                        >
                          {displayAvatar ? (
                            <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#F5EEE8] flex items-center justify-center">
                              <User size={40} className="text-[#C8A882]" />
                            </div>
                          )}
                          {editing && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                              <Upload size={22} className="text-white" />
                            </div>
                          )}
                        </div>
                        {editing && (
                          <button onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg"
                            style={{ background: unitColor }}>
                            <Upload size={14} />
                          </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden" onChange={handleAvatarChange} />
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        {editing ? (
                          <input
                            type="text"
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            placeholder="Full name"
                            className="text-xl font-bold text-[#1A1210] w-full px-3 py-2 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none mb-2"
                          />
                        ) : (
                          <h4 className="text-xl font-bold text-[#1A1210] mb-1" style={{ fontFamily: "'Inter', serif" }}>
                            {profile?.full_name || "—"}
                          </h4>
                        )}
                        <p className="text-[#6B5E59] text-sm">{profile?.email}</p>
                        <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                          {profile?.unit && (
                            <span className="px-2.5 py-1 rounded-full text-white text-xs font-semibold" style={{ background: unitColor }}>
                              {profile.unit}
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                            style={{ background: "#F0E8E0", color: "#8B6E52" }}>
                            {profile?.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Course */}
                      <ProfileField
                        icon={<GraduationCap size={16} className="text-[#9B1B2E]" />}
                        label="Course"
                        value={profile?.course}
                        editing={editing}
                        editValue={editCourse}
                        placeholder="e.g., BS Computer Science"
                        onChange={setEditCourse}
                      />
                      {/* Student Number */}
                      <ProfileField
                        icon={<Hash size={16} className="text-[#9B1B2E]" />}
                        label="Student Number"
                        value={profile?.student_number}
                        editing={editing}
                        editValue={editStudentNumber}
                        placeholder="e.g., 2021-12345"
                        onChange={setEditStudentNumber}
                      />
                      {/* Unit Info — full width */}
                      <div className="sm:col-span-2">
                        <ProfileField
                          icon={<Info size={16} className="text-[#9B1B2E]" />}
                          label="Unit-Related Information"
                          value={profile?.unit_info}
                          editing={editing}
                          editValue={editUnitInfo}
                          placeholder="Your role or involvement within your unit…"
                          onChange={setEditUnitInfo}
                          multiline
                        />
                      </div>
                      {/* Experience — full width */}
                      <div className="sm:col-span-2">
                        <ProfileField
                          icon={<Award size={16} className="text-[#9B1B2E]" />}
                          label="Experience or Awards"
                          value={profile?.experience_awards}
                          editing={editing}
                          editValue={editExperienceAwards}
                          placeholder="Competitions, performances, recognitions…"
                          onChange={setEditExperienceAwards}
                          multiline
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Reusable profile field component ──────────────────────────────────────────
function ProfileField({
  icon, label, value, editing, editValue, placeholder, onChange, multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
  editing: boolean;
  editValue: string;
  placeholder: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const inputClass =
    "w-full px-3 py-2.5 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all text-sm text-[#1A1210]";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-[#6B5E59] uppercase tracking-wide">{label}</span>
      </div>
      {editing ? (
        multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        )
      ) : (
        <p className="text-sm text-[#2D2320] px-1 min-h-[1.5rem]">
          {value || <span className="text-[#C8A882] italic">Not set</span>}
        </p>
      )}
    </div>
  );
}
