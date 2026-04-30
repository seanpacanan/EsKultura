import { useEffect, useState } from "react";
import { Bell, BookOpen, Clock, CheckCircle2, XCircle, Loader2, Send, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
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
  const { profile, session } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);

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
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.2)", fontFamily: "'Playfair Display', serif" }}
              >
                {initials}
              </div>
              <div>
                <p className="text-white/70 text-sm">Welcome back,</p>
                <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {profile?.full_name || "Artist"}!
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.unit && (
                <span className="px-3 py-1.5 rounded-full text-white text-sm font-semibold"
                  style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  {profile.unit}
                </span>
              )}
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: "#C8962C", color: "white" }}>
                {profile?.status === "active" ? "✓ Active Member" : profile?.status === "pending" ? "⏳ Pending" : "Member"}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Announcements feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-bold text-[#1A1210]"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem" }}>
                <Bell size={18} className="text-[#9B1B2E]" />
                Announcements
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
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl p-5 bg-white border border-[#F0E8E0]"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-bold text-[#1A1210]" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem" }}>
                        {ann.title}
                      </h4>
                      {ann.unit ? (
                        <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
                          style={{ background: unitColors[ann.unit] || "#9B1B2E" }}>
                          {ann.unit}
                        </span>
                      ) : (
                        <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ background: "#F0E8E0", color: "#8B6E52" }}>
                          Global
                        </span>
                      )}
                    </div>
                    <p className="text-[#6B5E59] text-sm leading-relaxed">{ann.content}</p>
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#F0E8E0]">
                      <span className="text-[#6B5E59]/60 text-xs">{formatDate(ann.created_at)}</span>
                      {ann.created_by_name && (
                        <span className="text-[#6B5E59]/60 text-xs">by {ann.created_by_name}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Membership status */}
            <div className="rounded-2xl bg-white p-5 border border-[#F0E8E0]" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 className="font-bold text-[#1A1210] mb-4" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem" }}>
                Membership Status
              </h3>

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
                    <p className="text-xs text-[#6B5E59]/70 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                      Your request is awaiting review by the unit coordinator.
                    </p>
                  )}
                  {latestRequest.status === "approved" && (
                    <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 border border-green-100">
                      🎉 You are an active member of {latestRequest.unit}!
                    </p>
                  )}
                  {latestRequest.status === "rejected" && profile?.unit && (
                    <button
                      onClick={submitRequest}
                      disabled={submittingRequest}
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-white text-sm font-medium"
                      style={{ background: "#9B1B2E" }}
                    >
                      <Send size={13} /> Reapply
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-[#6B5E59]">No membership request yet.</p>
                  {profile?.unit && (
                    <button
                      onClick={submitRequest}
                      disabled={submittingRequest}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}
                    >
                      {submittingRequest ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Apply to {profile.unit}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* My Unit info */}
            {profile?.unit && (
              <div
                className="rounded-2xl p-5 text-white relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${unitColor}, ${unitColor}CC)`, boxShadow: `0 8px 24px -4px ${unitColor}50` }}
              >
                <div className="relative z-10">
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">Your Unit</p>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.5rem" }}>
                    {profile.unit}
                  </h3>
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
      </main>
    </div>
  );
}
