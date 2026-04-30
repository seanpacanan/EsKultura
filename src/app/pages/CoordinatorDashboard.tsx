import { useEffect, useState } from "react";
import { Users, Bell, CheckCircle2, XCircle, Clock, Plus, Pencil, Trash2, Loader2, RefreshCw, X } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { api, Profile, MembershipRequest, Announcement } from "../lib/api";
import { AppHeader } from "../components/AppHeader";
import { toast } from "sonner";

const unitColors: Record<string, string> = {
  Himig: "#9B1B2E", Teatro: "#7D1525", Katha: "#C8962C", Ritmo: "#E0703A", Likha: "#8B6E52",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

type Tab = "requests" | "members" | "announcements";

export function CoordinatorDashboard() {
  return <CoordContent />;
}

function CoordContent() {
  const { profile, session } = useAuth();
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Announcement form state
  const [showForm, setShowForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annSaving, setAnnSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const unit = profile?.unit;
  const unitColor = unit ? unitColors[unit] : "#9B1B2E";

  const fetchData = async () => {
    if (!session?.access_token || !unit) return;
    setLoading(true);
    try {
      const [reqs, mems, anns] = await Promise.all([
        api.getMembershipRequests(session.access_token),
        api.getUnitProfiles(unit, session.access_token),
        api.getAnnouncements(session.access_token),
      ]);
      setRequests(reqs);
      setMembers(mems);
      setAnnouncements(anns);
    } catch (err) {
      console.error("Coordinator fetch error:", err);
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [session?.access_token, unit]);

  const handleMembershipAction = async (id: string, status: "approved" | "rejected") => {
    if (!session?.access_token) return;
    setActionLoading(id);
    try {
      await api.updateMembershipRequest(id, status, session.access_token);
      toast.success(`Request ${status}`);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
    setActionLoading(null);
  };

  const openCreate = () => {
    setEditingAnn(null);
    setAnnTitle("");
    setAnnContent("");
    setShowForm(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnTitle(ann.title);
    setAnnContent(ann.content);
    setShowForm(true);
  };

  const saveAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) { toast.error("Title and content required"); return; }
    if (!session?.access_token) return;
    setAnnSaving(true);
    try {
      if (editingAnn) {
        await api.updateAnnouncement(editingAnn.id, { title: annTitle, content: annContent }, session.access_token);
        toast.success("Announcement updated");
      } else {
        await api.createAnnouncement({ title: annTitle, content: annContent }, session.access_token);
        toast.success("Announcement published");
      }
      setShowForm(false);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
    setAnnSaving(false);
  };

  const deleteAnnouncement = async (id: string) => {
    if (!session?.access_token) return;
    try {
      await api.deleteAnnouncement(id, session.access_token);
      toast.success("Announcement deleted");
      setDeleteConfirmId(null);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const activeMembers = members.filter((m) => m.status === "active");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "requests", label: "Requests", icon: <Clock size={15} />, count: pendingRequests.length },
    { id: "members", label: "Members", icon: <Users size={15} />, count: activeMembers.length },
    { id: "announcements", label: "Announcements", icon: <Bell size={15} />, count: announcements.length },
  ];

  // Guard: coordinator must have a unit assigned (placed AFTER all hooks to follow Rules of Hooks)
  if (!unit) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDFAF4", fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center p-8 rounded-2xl bg-white border border-[#F0E8E0] shadow-sm max-w-sm">
          <p className="text-[#1A1210] font-semibold text-lg">No unit assigned</p>
          <p className="text-[#6B5E59] text-sm mt-2">Your coordinator account has no unit assigned yet. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FDFAF4", fontFamily: "'Inter', sans-serif" }}>
      <AppHeader />

      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        {/* Unit Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden mb-8"
          style={{ background: `linear-gradient(135deg, ${unitColor}, ${unitColor}BB)`, boxShadow: `0 10px 40px -10px ${unitColor}60` }}
        >
          <div className="px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm font-medium uppercase tracking-wide">Unit Coordinator</p>
              <h2 className="text-white font-bold text-2xl mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                {unit} Unit
              </h2>
              <p className="text-white/60 text-sm mt-0.5">{profile?.full_name}</p>
            </div>
            <div className="flex gap-4">
              {[
                { label: "Members", value: activeMembers.length },
                { label: "Pending", value: pendingRequests.length },
                { label: "Posts", value: announcements.length },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-[#F0E8E0]" style={{ width: "fit-content" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: tab === t.id ? unitColor : "transparent",
                color: tab === t.id ? "white" : "#6B5E59",
              }}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{
                    background: tab === t.id ? "rgba(255,255,255,0.3)" : `${unitColor}20`,
                    color: tab === t.id ? "white" : unitColor,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
          <button onClick={fetchData} className="p-2 text-[#6B5E59] hover:text-[#9B1B2E] rounded-lg hover:bg-[#9B1B2E]/5 ml-1">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" style={{ color: unitColor }} />
          </div>
        ) : (
          <>
            {/* Membership Requests Tab */}
            {tab === "requests" && (
              <div className="flex flex-col gap-4">
                {requests.length === 0 ? (
                  <EmptyState icon={<Clock size={28} />} message="No membership requests yet" />
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="bg-white rounded-xl p-5 border border-[#F0E8E0] flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-[#1A1210]">{req.user_name || "Unknown"}</p>
                        <p className="text-[#6B5E59] text-sm">{req.user_email}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-[#6B5E59]/60">{formatDate(req.created_at)}</span>
                          <StatusBadge status={req.status} />
                        </div>
                      </div>
                      {req.status === "pending" && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleMembershipAction(req.id, "approved")}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-60"
                            style={{ background: "#16a34a" }}
                          >
                            {actionLoading === req.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleMembershipAction(req.id, "rejected")}
                            disabled={actionLoading === req.id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border disabled:opacity-60"
                            style={{ borderColor: "#E8DDD5", color: "#6B5E59" }}
                          >
                            <XCircle size={13} />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Members Tab */}
            {tab === "members" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.length === 0 ? (
                  <div className="col-span-full"><EmptyState icon={<Users size={28} />} message="No members yet" /></div>
                ) : (
                  members.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl p-5 border border-[#F0E8E0]">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                          style={{ background: `linear-gradient(135deg, ${unitColor}, ${unitColor}BB)` }}
                        >
                          {(m.full_name || m.email).slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1210] text-sm">{m.full_name || "—"}</p>
                          <p className="text-[#6B5E59] text-xs">{m.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={m.status as "active" | "inactive" | "pending"} />
                        <span className="text-xs text-[#6B5E59]/60">{formatDate(m.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Announcements Tab */}
            {tab === "announcements" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    style={{ background: `linear-gradient(135deg, ${unitColor}, ${unitColor}CC)` }}
                  >
                    <Plus size={15} /> New Announcement
                  </button>
                </div>

                {announcements.length === 0 ? (
                  <EmptyState icon={<Bell size={28} />} message="No announcements yet" />
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="bg-white rounded-xl p-5 border border-[#F0E8E0]">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-[#1A1210]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem" }}>
                          {ann.title}
                        </h4>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => openEdit(ann)} className="p-1.5 rounded-lg hover:bg-[#F0E8E0] text-[#6B5E59] transition-colors">
                            <Pencil size={14} />
                          </button>
                          {deleteConfirmId === ann.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => deleteAnnouncement(ann.id)}
                                className="px-2 py-1 rounded-lg text-xs text-white font-medium"
                                style={{ background: "#dc2626" }}>
                                Confirm
                              </button>
                              <button onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 rounded-lg text-xs border border-[#E8DDD5] text-[#6B5E59]">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDeleteConfirmId(ann.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#6B5E59] hover:text-red-600 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[#6B5E59] text-sm leading-relaxed mt-2">{ann.content}</p>
                      <p className="text-[#6B5E59]/50 text-xs mt-3 pt-3 border-t border-[#F0E8E0]">{formatDate(ann.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Announcement Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0E8E0]">
              <h3 className="font-bold text-[#1A1210]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>
                {editingAnn ? "Edit Announcement" : "New Announcement"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-[#F0E8E0] text-[#6B5E59]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#2D2320]">Title</label>
                <input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="px-4 py-3 rounded-xl border border-[#E8DDD5] focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#2D2320]">Content</label>
                <textarea
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder="Write your announcement here…"
                  rows={5}
                  className="px-4 py-3 rounded-xl border border-[#E8DDD5] focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all resize-none"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#E8DDD5] text-[#6B5E59] font-medium hover:border-[#9B1B2E]">
                  Cancel
                </button>
                <button
                  onClick={saveAnnouncement}
                  disabled={annSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, ${unitColor}, ${unitColor}CC)` }}
                >
                  {annSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                  {editingAnn ? "Update" : "Publish"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    active: { bg: "#f0fdf4", color: "#16a34a", icon: <CheckCircle2 size={11} /> },
    pending: { bg: "#fffbeb", color: "#d97706", icon: <Clock size={11} /> },
    inactive: { bg: "#f9fafb", color: "#6b7280", icon: null },
    approved: { bg: "#f0fdf4", color: "#16a34a", icon: <CheckCircle2 size={11} /> },
    rejected: { bg: "#fef2f2", color: "#dc2626", icon: <XCircle size={11} /> },
  };
  const s = styles[status] || styles.inactive;
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ background: s.bg, color: s.color, borderColor: `${s.color}30` }}>
      {s.icon}<span className="capitalize">{status}</span>
    </span>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E8DDD5] py-16 text-center">
      <div className="flex justify-center mb-3 text-[#C8962C]/30">{icon}</div>
      <p className="text-[#6B5E59] font-medium">{message}</p>
    </div>
  );
}
