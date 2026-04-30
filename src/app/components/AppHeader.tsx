import { useNavigate, useLocation } from "react-router";
import { LogOut, LayoutDashboard, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logoSrc from "../../assets/logo.png";
import { toast } from "sonner";
import type { Role } from "../lib/api";

const unitColors: Record<string, string> = {
  Himig: "#9B1B2E",
  Teatro: "#7D1525",
  Katha: "#C8962C",
  Ritmo: "#E0703A",
  Likha: "#8B6E52",
};

const roleBadgeStyle: Record<Role, { bg: string; text: string; label: string }> = {
  admin: { bg: "#9B1B2E18", text: "#9B1B2E", label: "Administrator" },
  coordinator: { bg: "#C8962C18", text: "#A87520", label: "Coordinator" },
  viewer: { bg: "#8B6E5218", text: "#6E5040", label: "Member" },
};

export function AppHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const navLinks =
    profile?.role === "admin"
      ? [
          { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
        ]
      : profile?.role === "coordinator"
      ? [
          { href: "/coordinator", label: "My Unit", icon: <Users size={15} /> },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
        ];

  const roleInfo = profile ? roleBadgeStyle[profile.role] : null;
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile?.email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "rgba(253,250,244,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(200,150,44,0.15)",
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm border border-[#E8DDD5] flex-shrink-0">
              <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span
              className="text-[#9B1B2E] group-hover:text-[#C8962C] transition-colors hidden sm:block"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem" }}
            >
              Eskultura
            </span>
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  color: location.pathname === link.href ? "#9B1B2E" : "#6B5E59",
                  background:
                    location.pathname === link.href
                      ? "#9B1B2E10"
                      : "transparent",
                }}
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            {/* Unit badge */}
            {profile?.unit && (
              <span
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-white"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  background:
                    unitColors[profile.unit] || "#9B1B2E",
                }}
              >
                {profile.unit}
              </span>
            )}

            {/* Role badge */}
            {roleInfo && (
              <span
                className="hidden md:flex items-center px-3 py-1 rounded-full"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.72rem",
                  background: roleInfo.bg,
                  color: roleInfo.text,
                }}
              >
                {roleInfo.label}
              </span>
            )}

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #9B1B2E, #C8962C)",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
              }}
            >
              {initials}
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[#6B5E59] hover:text-[#9B1B2E] hover:bg-[#9B1B2E]/5 transition-all duration-200"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.82rem" }}
              title="Sign out"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
