import { Facebook, Mail, MapPin, Heart } from "lucide-react";
import logoSrc from "../../assets/logo.png";

const units = ["Himig", "Teatro", "Katha", "Ritmo", "Likha"];

const scrollTo = (href: string) => {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

export function Footer() {
  return (
    <footer id="contact" style={{ background: "#1A1210" }}>
      {/* Top gradient border */}
      <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #C8962C60, #9B1B2E60, transparent)" }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white rounded-full shadow-md">
                <img src={logoSrc} alt="EsKultura Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <p className="text-white" style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.1rem" }}>
                  Eskultura
                </p>
                <p className="text-white/40" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.62rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Eskuwelahan ng Manlililok
                </p>
              </div>
            </div>

            <p
              className="text-white/55"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.75 }}
            >
              A digital space where creativity shapes Filipino culture through arts, performance, and expression.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-[#1877F2] transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="mailto:eskultura@example.com"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* About column */}
          <div className="flex flex-col gap-4">
            <h4
              className="text-white/90"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              About
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Our Story", href: "#about" },
                { label: "Mission & Vision", href: "#about" },
                { label: "Core Values", href: "#about" },
                { label: "History", href: "#about" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className="text-left text-white/55 hover:text-[#C8962C] transition-colors duration-200"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.875rem" }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Units column */}
          <div className="flex flex-col gap-4">
            <h4
              className="text-white/90"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Units
            </h4>
            <div className="flex flex-col gap-2.5">
              {units.map((unit) => (
                <button
                  key={unit}
                  onClick={() => scrollTo("#units")}
                  className="text-left text-white/55 hover:text-[#C8962C] transition-colors duration-200 group flex items-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.875rem" }}
                >
                  <span
                    className="w-1 h-1 rounded-full bg-[#C8962C] opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  />
                  {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Contact column */}
          <div className="flex flex-col gap-4">
            <h4
              className="text-white/90"
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.85rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              Contact
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={15} className="text-[#C8962C] mt-0.5 flex-shrink-0" />
                <p className="text-white/55" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  Barangay Malinta Los Banos Laguna, Los Baños,<br />Philippines
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={15} className="text-[#C8962C] flex-shrink-0" />
                <a
                  href="mailto:eskultura@example.com"
                  className="text-white/55 hover:text-[#C8962C] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}
                >
                  eskulturalspulb@gmail.com
                </a>
              </div>

              {/* Newsletter */}
              <div className="mt-2">
                <p className="text-white/70 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.82rem" }}>
                  Get updates from Eskultura
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-white/30 outline-none focus:border-[#C8962C]/50 transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
                  />
                  <button
                    className="px-3 py-2 rounded-lg text-white text-xs font-semibold transition-all hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #a47251, #a47251)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-14 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p
              className="text-white/35 text-center sm:text-left"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
            >
              © {new Date().getFullYear()} Eskultura. All rights reserved.{" "}
              <span className="text-white/20">·</span>{" "}
             
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
