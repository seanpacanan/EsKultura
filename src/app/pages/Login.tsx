import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { useAuth, getRedirectPath } from "../context/AuthContext";
import { toast } from "sonner";
import logoSrc from '../../assets/logo.png';

function FilipinoBg() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 12 }, (_, col) => {
          const x = col * 48 + (row % 2 === 0 ? 0 : 24);
          const y = row * 48;
          return (
            <rect key={`${row}-${col}`} x={x} y={y} width="18" height="18" rx="2"
              transform={`rotate(45 ${x + 9} ${y + 9})`} fill="white" />
          );
        })
      )}
      <circle cx="250" cy="350" r="120" stroke="white" strokeWidth="1" fill="none" strokeDasharray="5 7" />
      <circle cx="250" cy="350" r="180" stroke="white" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

export function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    setError("");

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const profile = result.profile;
    toast.success("Welcome back!");
    navigate(getRedirectPath(profile ?? null), { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left Panel — Cultural Visual */}
      <div
        className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1A1210 0%, #3A0C14 50%, #2D1A06 100%)" }}
      >
        <FilipinoBg />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-lg">
            <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <p className="text-white" style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.1rem" }}>EsKultura</p>
            <p className="text-white/40" style={{ fontSize: "0.62rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>Eskuwelahan ng Manlililok ng Kulturang Pilipino</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col gap-6">
          <h2 style={{ fontFamily: "'Inter', serif", fontWeight: 800, fontSize: "2.4rem", lineHeight: 1.15, color: "white" }}>
            Welcome back to{" "}
            <span style={{ backgroundImage: "linear-gradient(135deg, #A47251, #A47251)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Eskultura!
            </span>
          </h2>
          <p className="text-white/60" style={{ fontSize: "1rem", lineHeight: 1.75 }}>
            Continue your journey in shaping Filipino culture through arts, performance, and expression.
          </p>

          {/* Unit pills */}
          <div className="flex flex-wrap gap-2">
            {["🎵 Himig", "🎭 Teatro", "✍️ Katha", "💃 Ritmo", "🎨 Likha"].map((unit) => (
              <span
                key={unit}
                className="px-3 py-1.5 rounded-full text-white/70 text-xs"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {unit}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="relative z-10 text-white/30 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem" }}>
          "Sining · Kultura · Paglikha"
        </p>
      </div>

      {/* Right Panel — Form */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{ background: "#FDFAF4" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm border border-[#E8DDD5]">
              <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span style={{ fontFamily: "'Inter', serif", fontWeight: 700, color: "#A47251" }}>EsKultura</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Inter', serif", fontWeight: 800, fontSize: "2rem", color: "#1A1210", lineHeight: 1.2 }}>
              Sign in to your account
            </h1>
            <p className="mt-2 text-[#6B5E59]" style={{ fontSize: "0.9rem" }}>
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#A47251] font-semibold hover:underline">
                Sign up free
              </Link>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E8DDD5] bg-white focus:border-[#9B1B2E] focus:ring-2 focus:ring-[#9B1B2E]/10 outline-none transition-all"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.9rem" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5E59] hover:text-[#9B1B2E] transition-colors"
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 mt-1"
              style={{ background: "linear-gradient(135deg, #A47251, #A47251)" }}
            >
              {loading ? (
                <><Loader2 size={17} className="animate-spin" /> Signing in…</>
              ) : (
                <><span>Sign In</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-[#6B5E59]/60 text-xs">
            By signing in, you agree to Eskultura's Terms of Service and Privacy Policy.
          </p>
          <p className="mt-3 text-center">
            <Link to="/" className="text-[#A47251]/70 hover:text-[#A47251] text-xs transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
