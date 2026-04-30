import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth, getRedirectPath } from "../context/AuthContext";
import { toast } from "sonner";
import logoSrc from '../../assets/logo.png';

function FilipinoBg() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 500 900" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => {
          const x = col * 48 + (row % 2 === 0 ? 0 : 24);
          const y = row * 48;
          return <rect key={`${row}-${col}`} x={x} y={y} width="18" height="18" rx="2" transform={`rotate(45 ${x + 9} ${y + 9})`} fill="white" />;
        })
      )}
      <circle cx="250" cy="450" r="150" stroke="white" strokeWidth="1" fill="none" strokeDasharray="5 7" />
    </svg>
  );
}

const passwordStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "Weak", color: "#E0703A" },
    { label: "Fair", color: "#C8962C" },
    { label: "Good", color: "#4CAF50" },
    { label: "Strong", color: "#2E7D32" },
  ];
  return { score, ...levels[Math.max(0, score - 1)] };
};

export function Signup() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwStrength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create account via server
      await api.signup({ email, password, full_name: fullName.trim() });

      // 2. Sign in automatically
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      toast.success("Account created! Let's complete your profile.");
      navigate(getRedirectPath(result.profile ?? null), { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account";
      setError(message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel */}
      <div
        className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A1210 0%, #3A0C14 50%, #2D1A06 100%)" }}
      >
        <FilipinoBg />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg">
            <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <p className="text-white" style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.1rem" }}>Eskultura</p>
            <p className="text-white/40" style={{ fontSize: "0.62rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Eskuwelahan ng Manlililok ng Kulturang Pilipino</p>
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <h2 style={{ fontFamily: "'Inter', serif", fontWeight: 800, fontSize: "2.2rem", lineHeight: 1.15, color: "white" }}>
            Join the{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #C8962C, #E0703A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              community
            </span>{" "}
            of Filipino artists
          </h2>
          <p className="text-white/60" style={{ fontSize: "0.95rem", lineHeight: 1.75 }}>
            Join 500+ students celebrating and preserving the living heritage of Filipino arts and culture.
          </p>
          <div className="flex flex-col gap-2.5">
            {[
              "Access to 5 creative units",
              "Community events and activities",
              "AI-powered announcements",
              "Cultural workshops & performances",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle2 size={14} className="text-[#C8962C] flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/30 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem" }}>
          "Sining · Kultura · Paglikha"
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: "#FDFAF4" }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-[#E8DDD5]">
              <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span style={{ fontFamily: "'Inter', serif", fontWeight: 700, color: "#A47251" }}>Eskultura</span>
          </div>

          <div className="mb-8">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "2rem", color: "#1A1210", lineHeight: 1.2 }}>
              Create your account
            </h1>
            <p className="mt-2 text-[#6B5E59]" style={{ fontSize: "0.9rem" }}>
              Already a member?{" "}
              <Link to="/login" className="text-[#A47251] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2D2320] text-sm font-semibold">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Juan dela Cruz"
                className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2D2320] text-sm font-semibold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2D2320] text-sm font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E8DDD5] bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5E59]">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Strength meter */}
              {password && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwStrength.score ? pwStrength.color : "#E8DDD5" }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: pwStrength.color, fontWeight: 500 }}>{pwStrength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2D2320] text-sm font-semibold">Confirm Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat your password"
                className="px-4 py-3 rounded-xl border border-[#E8DDD5] bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                required
              />
              {confirmPw && password !== confirmPw && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 mt-1"
              style={{ background: "linear-gradient(135deg, #A47251, #A47251)" }}
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Creating account…</>
              ) : (
                <><span>Create Account</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[#6B5E59]/60 text-xs">
            By creating an account, you agree to Eskultura's Terms of Service.
          </p>
          <p className="mt-3 text-center">
            <Link to="/" className="text-[#9B1B2E]/70 hover:text-[#9B1B2E] text-xs transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
