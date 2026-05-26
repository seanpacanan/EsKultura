import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, CheckCircle2, Loader2, Upload, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth, getRedirectPath } from "../context/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";

type Unit = "Himig" | "Teatro" | "Katha" | "Ritmo" | "Likha";

const units: {
  id: Unit;
  name: string;
  tagline: string;
  emoji: string;
  color: string;
  lightBg: string;
  description: string;
}[] = [
    { id: "Himig", name: "Himig", tagline: "Music & Vocal Performance", emoji: "🎵", color: "#9B1B2E", lightBg: "#FFF5F7", description: "Filipino musical traditions, from kundiman to contemporary." },
    { id: "Teatro", name: "Teatro", tagline: "Acting & Stage Performance", emoji: "🎭", color: "#7D1525", lightBg: "#FFF4F5", description: "From sarsuwela to modern drama — where emotion meets artistry." },
    { id: "Katha", name: "Katha", tagline: "Writing & Storytelling", emoji: "✍️", color: "#C8962C", lightBg: "#FFFBF2", description: "Poetry, prose, and scripts — the Filipino literary voice." },
    { id: "Ritmo", name: "Ritmo", tagline: "Dance & Movement", emoji: "💃", color: "#E0703A", lightBg: "#FFF6F2", description: "Folk, contemporary, and street dance as living heritage." },
    { id: "Likha", name: "Likha", tagline: "Visual Arts & Design", emoji: "🎨", color: "#8B6E52", lightBg: "#FBF8F5", description: "From traditional crafts to digital artistry." },
  ];

const stepLabels = ["Your Name", "Choose Unit", "Your Profile"];

export function Onboarding() {
  const { profile, session, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Step 3 fields
  const [course, setCourse] = useState(profile?.course || "");
  const [studentNumber, setStudentNumber] = useState(profile?.student_number || "");
  const [unitInfo, setUnitInfo] = useState(profile?.unit_info || "");
  const [experienceAwards, setExperienceAwards] = useState(profile?.experience_awards || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setError("Please enter your full name."); return; }
    setError("");
    setStep(2);
  };

  const handleStep2 = () => {
    if (!selectedUnit) { setError("Please choose a unit."); return; }
    setError("");
    setStep(3);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedUnit) { setError("Please choose a unit."); return; }
    if (!session?.access_token) { setError("Session expired. Please sign in again."); return; }

    setLoading(true);
    setError("");

    try {
      // Upload avatar first if one was selected
      let avatarUrl: string | undefined;
      if (avatarFile) {
        const { avatar_url } = await api.uploadAvatar(avatarFile, session.access_token);
        avatarUrl = avatar_url;
      }

      // Update profile with all fields
      await api.updateProfile(
        {
          full_name: fullName.trim(),
          unit: selectedUnit,
          course: course.trim() || undefined,
          student_number: studentNumber.trim() || undefined,
          unit_info: unitInfo.trim() || undefined,
          experience_awards: experienceAwards.trim() || undefined,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        },
        session.access_token
      );

      // Auto-submit membership request
      try {
        await api.createMembershipRequest(selectedUnit, session.access_token);
      } catch {
        // Ignore if request already exists
      }

      await refreshProfile();
      toast.success("Profile complete! Welcome to EsKultura 🎉");

      const updatedProfile = await api.getProfile(session.access_token);
      navigate(getRedirectPath(updatedProfile), { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save profile";
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FDFAF4 0%, #FFF8EE 50%, #FDF4F0 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 12 }, (_, col) => {
              const x = col * 70 + (row % 2 === 0 ? 0 : 35);
              const y = row * 70;
              return <rect key={`${row}-${col}`} x={x} y={y} width="24" height="24" rx="3" transform={`rotate(45 ${x + 12} ${y + 12})`} fill="#9B1B2E" />;
            })
          )}
        </svg>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #C8962C, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle, #9B1B2E, transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "white" }}>
          {/* Top accent */}
          <div className="h-1.5" style={{ background: "linear-gradient(90deg, #9B1B2E, #C8962C, #E0703A)" }} />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-9 h-9">
                  <svg viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="19" fill="#9B1B2E" />
                    <path d="M14 26L20 10L26 26" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16.5 20.5H23.5" stroke="#C8962C" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1rem", color: "#9B1B2E" }}>
                  EsKultura
                </span>
              </div>
              <h1 style={{ fontFamily: "'Inter', serif", fontWeight: 800, fontSize: "1.75rem", color: "#1A1210", lineHeight: 1.2 }}>
                Complete Your Profile
              </h1>
              <p className="mt-2 text-[#6B5E59]" style={{ fontSize: "0.9rem" }}>
                Just a few steps to join the EsKultura community
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                    style={{
                      background: step > s ? "#9B1B2E" : step === s ? "#9B1B2E" : "#E8DDD5",
                      color: step >= s ? "white" : "#6B5E59",
                    }}
                  >
                    {step > s ? <CheckCircle2 size={15} /> : s}
                  </div>
                  <span className="text-sm hidden sm:block" style={{ color: step === s ? "#9B1B2E" : "#6B5E59", fontWeight: step === s ? 600 : 400 }}>
                    {stepLabels[s - 1]}
                  </span>
                  {s < 3 && <div className="w-6 h-px bg-[#E8DDD5]" />}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* ── Step 1: Name ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <form onSubmit={handleStep1} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[#2D2320] font-semibold text-sm">
                        What's your full name?
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Maria Santos"
                        className="px-4 py-3.5 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all text-lg"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        autoFocus
                        required
                      />
                      <p className="text-[#6B5E59]/70 text-xs">
                        This will appear on your profile and membership card.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                      style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}
                    >
                      Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 2: Unit Selection ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="text-[#2D2320] font-semibold text-sm mb-1">
                        Hi {fullName}! Choose your creative unit:
                      </p>
                      <p className="text-[#6B5E59]/70 text-xs">
                        Select the unit that best matches your passion. You can only join one unit.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {units.map((unit) => {
                        const isSelected = selectedUnit === unit.id;
                        return (
                          <button
                            key={unit.id}
                            type="button"
                            onClick={() => setSelectedUnit(unit.id)}
                            className="flex items-start gap-3 p-4 rounded-xl text-left transition-all duration-200"
                            style={{
                              background: isSelected ? unit.color : unit.lightBg,
                              border: `2px solid ${isSelected ? unit.color : "transparent"}`,
                              transform: isSelected ? "scale(1.02)" : "scale(1)",
                              boxShadow: isSelected ? `0 8px 24px -4px ${unit.color}40` : "none",
                            }}
                          >
                            <span className="text-2xl">{unit.emoji}</span>
                            <div>
                              <p className="font-bold transition-colors" style={{ fontFamily: "'Inter', serif", color: isSelected ? "white" : "#1A1210", fontSize: "1rem" }}>
                                {unit.name}
                              </p>
                              <p className="text-xs font-medium" style={{ color: isSelected ? "rgba(255,255,255,0.8)" : unit.color }}>
                                {unit.tagline}
                              </p>
                              <p className="text-xs mt-1 transition-colors" style={{ color: isSelected ? "rgba(255,255,255,0.7)" : "#6B5E59" }}>
                                {unit.description}
                              </p>
                            </div>
                            {isSelected && <CheckCircle2 size={18} className="ml-auto flex-shrink-0 text-white" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(""); }}
                        className="px-6 py-3 rounded-xl border border-[#E8DDD5] text-[#6B5E59] hover:border-[#9B1B2E] hover:text-[#9B1B2E] transition-all"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleStep2}
                        disabled={!selectedUnit}
                        className="group flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}
                      >
                        Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Extended Profile + Avatar ── */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex flex-col gap-6">
                    <div>
                      <p className="text-[#2D2320] font-semibold text-sm mb-1">
                        Tell us more about yourself
                      </p>
                      <p className="text-[#6B5E59]/70 text-xs">
                        These details help your coordinator get to know you. All fields are optional.
                      </p>
                    </div>

                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="relative w-24 h-24 rounded-full overflow-hidden cursor-pointer group border-4 border-[#E8DDD5] hover:border-[#9B1B2E] transition-all duration-200"
                        style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#F5EEE8] flex items-center justify-center">
                            <User size={32} className="text-[#C8A882]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={20} className="text-white" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-[#9B1B2E] font-medium hover:underline"
                      >
                        {avatarPreview ? "Change photo" : "Upload profile picture"}
                      </button>
                      <p className="text-[#6B5E59]/60 text-xs">JPG, PNG, WebP · Max 5MB</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </div>

                    {/* Form fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#2D2320] font-semibold text-sm">Course</label>
                        <input
                          type="text"
                          value={course}
                          onChange={(e) => setCourse(e.target.value)}
                          placeholder="e.g., BS Computer Science"
                          className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[#2D2320] font-semibold text-sm">Student Number</label>
                        <input
                          type="text"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                          placeholder="e.g., 2021-12345"
                          className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#2D2320] font-semibold text-sm">Unit-Related Information</label>
                      <textarea
                        value={unitInfo}
                        onChange={(e) => setUnitInfo(e.target.value)}
                        placeholder="Tell us about your role or involvement within your unit…"
                        rows={3}
                        className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all text-sm resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[#2D2320] font-semibold text-sm">Experience or Awards</label>
                      <textarea
                        value={experienceAwards}
                        onChange={(e) => setExperienceAwards(e.target.value)}
                        placeholder="Competitions, performances, recognitions, achievements…"
                        rows={3}
                        className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-[#FDFAF4] focus:bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all text-sm resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => { setStep(2); setError(""); }}
                        className="px-6 py-3 rounded-xl border border-[#E8DDD5] text-[#6B5E59] hover:border-[#9B1B2E] hover:text-[#9B1B2E] transition-all"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="group flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
                        style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}
                      >
                        {loading ? (
                          <><Loader2 size={16} className="animate-spin" /> Saving…</>
                        ) : (
                          <><span>Join EsKultura</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[#6B5E59]/50 text-xs mt-6" style={{ fontFamily: "'Inter', sans-serif" }}>
          Your membership request will be reviewed by your unit coordinator.
        </p>
      </div>
    </div>
  );
}
