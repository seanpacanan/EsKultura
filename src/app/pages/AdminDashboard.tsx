import { useEffect, useState } from "react";
import { Users, Bell, CheckCircle2, XCircle, Clock, Shield, Plus, Pencil, Trash2, Loader2, RefreshCw, X, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { api, Profile, MembershipRequest, Announcement, Role } from "../lib/api";
import { AppHeader } from "../components/AppHeader";
import { toast } from "sonner";

const unitColors: Record<string, string> = {
  Himig: "#9B1B2E", Teatro: "#7D1525", Katha: "#C8962C", Ritmo: "#E0703A", Likha: "#8B6E52",
};

const UNITS = ["Himig", "Teatro", "Katha", "Ritmo", "Likha"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

type Tab = "overview" | "users" | "requests" | "announcements";

export function AdminDashboard() {
  return <AdminContent />;
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
    active: { bg: "#f0fdf4", color: "#16a34a", icon: <CheckCircle2 size={11} /> },
    pending: { bg: "#fffbeb", color: "#d97706", icon: <Clock size={11} /> },
    inactive: { bg: "#f9fafb", color: "#6b7280", icon: null },
    approved: { bg: "#f0fdf4", color: "#16a34a", icon: <CheckCircle2 size={11} /> },
    rejected: { bg: "#fef2f2", color: "#dc2626", icon: <XCircle size={11} /> },
  };
  const style = s[status] || s.inactive;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ background: style.bg, color: style.color, borderColor: `${style.color}30` }}>
      {style.icon}<span className="capitalize">{status}</span>
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const s: Record<Role, { bg: string; color: string }> = {
    admin: { bg: "#9B1B2E15", color: "#9B1B2E" },
    coordinator: { bg: "#C8962C15", color: "#A87520" },
    viewer: { bg: "#8B6E5215", color: "#6E5040" },
  };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{ background: s[role].bg, color: s[role].color }}>
      {role === "admin" && <Shield size={10} className="mr-1" />}
      {role}
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

function AdminContent() {
  const { profile, session } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [users, setUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Announcement form
  const [showForm, setShowForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [annUnit, setAnnUnit] = useState<string>("");
  const [annSaving, setAnnSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Search/filter
  const [searchUsers, setSearchUsers] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterReqStatus, setFilterReqStatus] = useState<string>("");

  const fetchData = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    try {
      const [us, reqs, anns] = await Promise.all([
        api.getAllProfiles(session.access_token),
        api.getMembershipRequests(session.access_token),
        api.getAnnouncements(session.access_token),
      ]);
      setUsers(us);
      setRequests(reqs);
      setAnnouncements(anns);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [session?.access_token]);

  const updateRole = async (userId: string, role: Role) => {
    if (!session?.access_token) return;
    setActionLoading(userId + "_role");
    try {
      await api.updateUserRole(userId, role, session.access_token);
      toast.success("Role updated");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
    setActionLoading(null);
  };

  const updateStatus = async (userId: string, status: "active" | "inactive") => {
    if (!session?.access_token) return;
    setActionLoading(userId + "_status");
    try {
      await api.updateUserStatus(userId, status, session.access_token);
      toast.success("Status updated");
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    }
    setActionLoading(null);
  };

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
    setEditingAnn(null); setAnnTitle(""); setAnnContent(""); setAnnUnit(""); setShowForm(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditingAnn(ann); setAnnTitle(ann.title); setAnnContent(ann.content); setAnnUnit(ann.unit || ""); setShowForm(true);
  };

  const saveAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) { toast.error("Title and content required"); return; }
    if (!session?.access_token) return;
    setAnnSaving(true);
    try {
      if (editingAnn) {
        await api.updateAnnouncement(editingAnn.id, { title: annTitle, content: annContent }, session.access_token);
        toast.success("Updated");
      } else {
        await api.createAnnouncement({ title: annTitle, content: annContent, unit: annUnit || null }, session.access_token);
        toast.success("Published");
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
      toast.success("Deleted");
      setDeleteConfirmId(null);
      await fetchData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  // Computed
  const activeUsers = users.filter((u) => u.status === "active").length;
  const pendingReqs = requests.filter((r) => r.status === "pending").length;
  const coordinators = users.filter((u) => u.role === "coordinator").length;

  const filteredUsers = users.filter((u) => {
    const matchSearch = !searchUsers || u.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) || u.email.toLowerCase().includes(searchUsers.toLowerCase());
    const matchUnit = !filterUnit || u.unit === filterUnit;
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchUnit && matchRole;
  });

  const filteredRequests = requests.filter((r) => !filterReqStatus || r.status === filterReqStatus);

  const tabList: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={15} /> },
    { id: "users", label: `Users (${users.length})`, icon: <Users size={15} /> },
    { id: "requests", label: `Requests (${pendingReqs} pending)`, icon: <Clock size={15} /> },
    { id: "announcements", label: `Announcements (${announcements.length})`, icon: <Bell size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#FDFAF4", fontFamily: "'Inter', sans-serif" }}>
      <AppHeader />

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Admin banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden mb-8"
          style={{ background: "linear-gradient(135deg, #1A1210 0%, #3A0C14 60%, #2D1A06 100%)", boxShadow: "0 10px 40px -10px rgba(26,18,16,0.5)" }}
        >
          <div className="px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield size={16} className="text-[#C8962C]" />
                <p className="text-[#C8962C] text-sm font-medium uppercase tracking-wide">System Administrator</p>
              </div>
              <h2 className="text-white font-bold text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                Admin Dashboard
              </h2>
              <p className="text-white/50 text-sm mt-0.5">{profile?.full_name} · {profile?.email}</p>
            </div>
            <div className="grid grid-cols-4 gap-5">
              {[
                { label: "Total Users", value: users.length },
                { label: "Active", value: activeUsers },
                { label: "Coordinators", value: coordinators },
                { label: "Pending", value: pendingReqs },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-white font-bold text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>{stat.value}</p>
                  <p className="text-white/40 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-[#F0E8E0]" style={{ width: "fit-content", maxWidth: "100%" }}>
          {tabList.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap"
              style={{ background: tab === t.id ? "#9B1B2E" : "transparent", color: tab === t.id ? "white" : "#6B5E59" }}>
              {t.icon}{t.label}
            </button>
          ))}
          <button onClick={fetchData} className="p-2 text-[#6B5E59] hover:text-[#9B1B2E] rounded-lg hover:bg-[#9B1B2E]/5 ml-1">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#9B1B2E]" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === "overview" && (
              <div className="flex flex-col gap-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: users.length, color: "#9B1B2E", icon: <Users size={20} /> },
                    { label: "Active Members", value: activeUsers, color: "#16a34a", icon: <CheckCircle2 size={20} /> },
                    { label: "Pending Requests", value: pendingReqs, color: "#d97706", icon: <Clock size={20} /> },
                    { label: "Announcements", value: announcements.length, color: "#C8962C", icon: <Bell size={20} /> },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-xl p-5 border border-[#F0E8E0]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}15`, color: stat.color }}>
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: stat.color }}>{stat.value}</p>
                      <p className="text-[#6B5E59] text-sm mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Unit breakdown */}
                <div className="bg-white rounded-2xl p-6 border border-[#F0E8E0]">
                  <h3 className="font-bold text-[#1A1210] mb-5" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem" }}>
                    Unit Breakdown
                  </h3>
                  <div className="grid sm:grid-cols-5 gap-4">
                    {UNITS.map((unit) => {
                      const count = users.filter((u) => u.unit === unit).length;
                      const active = users.filter((u) => u.unit === unit && u.status === "active").length;
                      const color = unitColors[unit];
                      return (
                        <div key={unit} className="rounded-xl p-4 flex flex-col gap-2" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                          <p className="font-bold" style={{ fontFamily: "'Playfair Display', serif", color, fontSize: "1.05rem" }}>{unit}</p>
                          <p className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color }}>{count}</p>
                          <p className="text-xs" style={{ color: `${color}99` }}>{active} active</p>
                          {count > 0 && (
                            <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(active / count) * 100}%`, background: color }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {tab === "users" && (
              <div className="flex flex-col gap-4">
                {/* Filters */}
                <div className="bg-white rounded-xl p-4 border border-[#F0E8E0] flex flex-wrap gap-3">
                  <input
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    placeholder="Search by name or email…"
                    className="flex-1 min-w-40 px-3 py-2 rounded-lg border border-[#E8DDD5] text-sm focus:border-[#9B1B2E] outline-none"
                  />
                  <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#E8DDD5] text-sm text-[#6B5E59] focus:border-[#9B1B2E] outline-none bg-white">
                    <option value="">All Units</option>
                    {UNITS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                  <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as Role | "")}
                    className="px-3 py-2 rounded-lg border border-[#E8DDD5] text-sm text-[#6B5E59] focus:border-[#9B1B2E] outline-none bg-white">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                {filteredUsers.length === 0 ? (
                  <EmptyState icon={<Users size={28} />} message="No users found" />
                ) : (
                  <div className="bg-white rounded-xl border border-[#F0E8E0] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#F0E8E0]" style={{ background: "#FDF8F4" }}>
                          {["Name / Email", "Unit", "Role", "Status", "Actions"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-[#6B5E59] text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => (
                          <tr key={u.id} className="border-b border-[#F0E8E0] last:border-0 hover:bg-[#FDF8F4] transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-[#1A1210]">{u.full_name || "—"}</p>
                              <p className="text-[#6B5E59]/70 text-xs">{u.email}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              {u.unit ? (
                                <span className="px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                                  style={{ background: unitColors[u.unit] }}>
                                  {u.unit}
                                </span>
                              ) : <span className="text-[#6B5E59]/40">—</span>}
                            </td>
                            <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
                            <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <select
                                  value={u.role}
                                  onChange={(e) => updateRole(u.id, e.target.value as Role)}
                                  disabled={actionLoading === u.id + "_role"}
                                  className="px-2 py-1 rounded-lg border border-[#E8DDD5] text-xs text-[#6B5E59] focus:border-[#9B1B2E] outline-none bg-white cursor-pointer"
                                >
                                  <option value="viewer">viewer</option>
                                  <option value="coordinator">coordinator</option>
                                  <option value="admin">admin</option>
                                </select>
                                <button
                                  onClick={() => updateStatus(u.id, u.status === "active" ? "inactive" : "active")}
                                  disabled={actionLoading === u.id + "_status"}
                                  className="px-2 py-1 rounded-lg text-xs font-medium border transition-colors"
                                  style={u.status === "active"
                                    ? { background: "#fef2f2", color: "#dc2626", borderColor: "#fca5a5" }
                                    : { background: "#f0fdf4", color: "#16a34a", borderColor: "#86efac" }}
                                >
                                  {u.status === "active" ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {tab === "requests" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {["", "pending", "approved", "rejected"].map((s) => (
                    <button key={s} onClick={() => setFilterReqStatus(s)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                      style={filterReqStatus === s
                        ? { background: "#9B1B2E", color: "white" }
                        : { background: "white", color: "#6B5E59", border: "1px solid #E8DDD5" }}>
                      {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                {filteredRequests.length === 0 ? (
                  <EmptyState icon={<Clock size={28} />} message="No requests found" />
                ) : (
                  <div className="bg-white rounded-xl border border-[#F0E8E0] overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#F0E8E0]" style={{ background: "#FDF8F4" }}>
                          {["Applicant", "Unit", "Date", "Status", "Actions"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left font-semibold text-[#6B5E59] text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((req) => (
                          <tr key={req.id} className="border-b border-[#F0E8E0] last:border-0 hover:bg-[#FDF8F4] transition-colors">
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-[#1A1210]">{req.user_name || "—"}</p>
                              <p className="text-[#6B5E59]/70 text-xs">{req.user_email}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                                style={{ background: unitColors[req.unit] }}>
                                {req.unit}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-[#6B5E59]/70 text-xs">{formatDate(req.created_at)}</td>
                            <td className="px-4 py-3.5"><StatusBadge status={req.status} /></td>
                            <td className="px-4 py-3.5">
                              {req.status === "pending" && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleMembershipAction(req.id, "approved")}
                                    disabled={actionLoading === req.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
                                    style={{ background: "#16a34a" }}>
                                    {actionLoading === req.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                                    Approve
                                  </button>
                                  <button onClick={() => handleMembershipAction(req.id, "rejected")}
                                    disabled={actionLoading === req.id}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border"
                                    style={{ borderColor: "#E8DDD5", color: "#6B5E59" }}>
                                    <XCircle size={11} /> Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Announcements Tab */}
            {tab === "announcements" && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-end">
                  <button onClick={openCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}>
                    <Plus size={15} /> New Announcement
                  </button>
                </div>

                {announcements.length === 0 ? (
                  <EmptyState icon={<Bell size={28} />} message="No announcements yet" />
                ) : (
                  <div className="flex flex-col gap-3">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="bg-white rounded-xl p-5 border border-[#F0E8E0] flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-[#1A1210]" style={{ fontFamily: "'Playfair Display', serif" }}>{ann.title}</h4>
                            {ann.unit ? (
                              <span className="px-2 py-0.5 rounded-full text-white text-xs font-semibold"
                                style={{ background: unitColors[ann.unit] }}>
                                {ann.unit}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{ background: "#F0E8E0", color: "#8B6E52" }}>Global</span>
                            )}
                          </div>
                          <p className="text-[#6B5E59] text-sm">{ann.content}</p>
                          <p className="text-[#6B5E59]/50 text-xs mt-2">
                            {formatDate(ann.created_at)} · by {ann.created_by_name}
                          </p>
                        </div>
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
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Announcement Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white overflow-hidden shadow-2xl">
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
                <input value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Title"
                  className="px-4 py-3 rounded-xl border border-[#E8DDD5] focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#2D2320]">Content</label>
                <textarea value={annContent} onChange={(e) => setAnnContent(e.target.value)} placeholder="Announcement content…"
                  rows={5} className="px-4 py-3 rounded-xl border border-[#E8DDD5] focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all resize-none"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }} />
              </div>
              {!editingAnn && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#2D2320]">Target Unit <span className="text-[#6B5E59]/60 font-normal">(optional — leave blank for global)</span></label>
                  <select value={annUnit} onChange={(e) => setAnnUnit(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-[#E8DDD5] focus:border-[#9B1B2E] outline-none bg-white"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}>
                    <option value="">Global (all units)</option>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-[#E8DDD5] text-[#6B5E59] font-medium hover:border-[#9B1B2E]">
                  Cancel
                </button>
                <button onClick={saveAnnouncement} disabled={annSaving}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}>
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
