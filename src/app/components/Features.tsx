import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Users, LayoutGrid, BookOpen, Sparkles } from "lucide-react";

const features = [
  {
    icon: <Users size={24} />,
    title: "Membership Tracking",
    description:
      "Efficiently manage member profiles, roles, attendance, and contributions across all five creative units in one unified dashboard.",
    color: "#9B1B2E",
    bg: "#FFF5F7",
    gradient: "linear-gradient(135deg, #9B1B2E, #7D1525)",
    delay: 0,
  },
  {
    icon: <LayoutGrid size={24} />,
    title: "Unit-Based Organization",
    description:
      "Structured workflows for each creative unit — Himig, Teatro, Katha, Ritmo, and Likha — with tailored tools for each discipline.",
    color: "#C8962C",
    bg: "#FFFBF2",
    gradient: "linear-gradient(135deg, #C8962C, #A87520)",
    delay: 0.1,
  },
  {
    icon: <BookOpen size={24} />,
    title: "Workshop & Program Records",
    description:
      "Keep workshops, skill tracks, and creative programs documented so coordinators preserve history and members always know what is on deck.",
    color: "#E0703A",
    bg: "#FFF6F2",
    gradient: "linear-gradient(135deg, #E0703A, #C05A28)",
    delay: 0.2,
  },
  {
    icon: <Sparkles size={24} />,
    title: "AI-Assisted Announcements",
    description:
      "Leverage AI to craft compelling, culturally resonant announcements and communications for your unit members and the wider student community.",
    color: "#8B6E52",
    bg: "#FBF8F5",
    gradient: "linear-gradient(135deg, #8B6E52, #6E5040)",
    delay: 0.3,
  },
];

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #FDF8F4 0%, #FDFAF4 100%)" }}>
      {/* Decorative borders */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C8962C50, transparent)" }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #9B1B2E40, transparent)" }} />

      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #C8962C25 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span
            className="inline-block mb-4 px-4 py-1.5 rounded-full"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "linear-gradient(135deg, #C8962C15, #E0703A15)",
              color: "#C8962C",
              border: "1px solid #C8962C25",
            }}
          >
            Platform Features
          </span>
          <h2
            style={{
              fontFamily: "'Inter', serif",
              fontWeight: 800,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#1A1210",
            }}
          >
            Everything Your Organization{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #C8962C, #E0703A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Needs
            </span>
          </h2>
          <p
            className="mt-4 max-w-lg mx-auto text-[#6B5E59]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "1rem", lineHeight: 1.75 }}
          >
            A complete digital toolkit designed specifically for student arts organizations, combining modern tech with cultural sensitivity.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: feature.delay + 0.2, ease: "easeOut" }}
              className="group relative flex flex-col gap-5 p-7 rounded-2xl cursor-default transition-all duration-300 hover:-translate-y-2"
              style={{
                background: feature.bg,
                border: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.05)",
              }}
            >
              {/* Hover overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${feature.color}06, ${feature.color}10)` }}
              />

              {/* Icon */}
              <div
                className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow duration-300"
                style={{ background: feature.gradient }}
              >
                {feature.icon}
              </div>

              {/* Text */}
              <div className="relative flex flex-col gap-2">
                <h3
                  className="text-[#1A1210]"
                  style={{
                    fontFamily: "'Inter', serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-[#6B5E59]"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    lineHeight: 1.7,
                  }}
                >
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent bar */}
              <div
                className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* Decorative divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 flex items-center gap-4"
        >
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, #C8962C40)" }} />
          <div className="flex items-center gap-2 px-4">
            <span className="text-lg">🌺</span>
            <span
              className="text-[#C8962C]"
              style={{ fontFamily: "'Inter', serif", fontWeight: 600, fontSize: "0.85rem", fontStyle: "italic" }}
            >EsKultura</span>
            <span className="text-lg">🌺</span>
          </div>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, #C8962C40, transparent)" }} />
        </motion.div>
      </div>
    </section>
  );
}
