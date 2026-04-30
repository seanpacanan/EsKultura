import { useState, useEffect } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { useAuth, getRedirectPath } from "../context/AuthContext";
import logoSrc from "../../assets/logo.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Units", href: "#units" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-amber-100/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <button
            onClick={() => scrollTo("#home")}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-sm border border-[#E8DDD5]">
              <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="flex flex-col leading-tight">
              <span
                className="group-hover:text-[#C8962C] transition-colors duration-300 text-[#a47251]"
                style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.0rem", letterSpacing: "-0.01em" }}
              >
                ESKULTURA
              </span>
              
            </div>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="relative text-[#2D2320]/80 hover:text-[#A47251] transition-colors duration-200 group"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.9rem" }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C8962C] rounded-full transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              // Authenticated state
              <button
                onClick={() => navigate(getRedirectPath(profile))}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  background: "linear-gradient(135deg, #9B1B2E, #7D1525)",
                }}
              >
                <LayoutDashboard size={15} />
                Go to Dashboard
              </button>
            ) : (
              // Guest state
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="px-5 py-2 rounded-lg border border-[#A47251] text-[#A47251] hover:bg-[#9B1B2E]/5 transition-all duration-200"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.875rem" }}
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2 rounded-lg bg-[#A47251] text-white hover:bg-[#A47251] shadow-md hover:shadow-lg hover:-translate-y-px transition-all duration-200"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.875rem" }}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-[#2D2320] hover:bg-[#9B1B2E]/10 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-amber-100 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  className="text-left py-2 text-[#2D2320]/80 hover:text-[#9B1B2E] border-b border-amber-50 transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "1rem" }}
                >
                  {link.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                {user && profile ? (
                  <button
                    onClick={() => { setMobileOpen(false); navigate(getRedirectPath(profile)); }}
                    className="w-full py-2.5 rounded-lg bg-[#9B1B2E] text-white"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                  >
                    Go to Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/login"); }}
                      className="w-full py-2.5 rounded-lg border border-[#9B1B2E] text-[#9B1B2E]"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/signup"); }}
                      className="w-full py-2.5 rounded-lg bg-[#9B1B2E] text-white"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
