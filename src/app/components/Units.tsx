import { useState } from "react";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const units = [
  {
    id: "himig",
    name: "Himig EsKultura",
    tagline: "Music & Vocal Performance",
    description:
      "This is the unit that gives meaning to music, where students gather to create beautiful melodies and harmonies. It opens the door to exploring different genres of music and developing skills in singing and playing instruments.",
    emoji: "🎵",
    color: "#9B1B2E",
    lightBg: "#FFF5F7",
    accent: "#C8962C",
    tags: ["Singing", "Instruments", "Composition"],
  },
  {
    id: "teatro",
    name: "Teatro EsKultura",
    tagline: "Acting & Stage Performance",
    description:
      "Teatro Eskultura is a group of students that brings stories to life on stage. This unit promotes and supports the art of theater within EsKultura. Each production they create contains stories and art that highlight important current issues.",
    emoji: "🎭",
    color: "#7D1525",
    lightBg: "#FFF4F5",
    accent: "#E0703A",
    tags: ["Acting", "Direction", "Stagecraft"],
  },
  {
    id: "katha",
    name: "Katha EsKultura",
    tagline: "Writing & Storytelling",
    description:
      "This is the unit that promotes the art of writing, where members express their thoughts through different forms of literature. Katha Eskultura encourages meaningful writing that conveys ideas and emotions.",
    emoji: "✍️",
    color: "#C8962C",
    lightBg: "#FFFBF2",
    accent: "#9B1B2E",
    tags: ["Poetry", "Fiction", "Scriptwriting"],
  },
  {
    id: "ritmo",
    name: "Ritmo EsKultura",
    tagline: "Dance & Movement",
    description:
      "This is the unit that gives voice to dance, where students express themselves through different styles and movements. It aims to captivate and engage the audience through meaningful movement and artistry.",
    emoji: "💃",
    color: "#E0703A",
    lightBg: "#FFF6F2",
    accent: "#9B1B2E",
    tags: ["Folk Dance", "Contemporary", "Choreography"],
  },
  {
    id: "likha",
    name: "Likha EsKultura",
    tagline: "Visual Arts & Design",
    description:
      "This is the unit that showcases visual arts, where members demonstrate skill in painting, drawing, and other visual art forms. This unit forms public artistic expression and presents works that highlight their talents.",
    emoji: "🎨",
    color: "#8B6E52",
    lightBg: "#FBF8F5",
    accent: "#C8962C",
    tags: ["Painting", "Sculpture", "Digital Art"],
  },
];

function UnitCard({ unit, index }: { unit: typeof units[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.1, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col rounded-2xl cursor-pointer overflow-hidden transition-all duration-400"
      style={{
        background: hovered ? unit.color : unit.lightBg,
        boxShadow: hovered
          ? `0 20px 50px -8px ${unit.color}55, 0 4px 20px -4px ${unit.color}33`
          : "0 2px 20px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        border: `1px solid ${hovered ? "transparent" : "rgba(0,0,0,0.07)"}`,
      }}
    >
      {/* Top decorative bar */}
      <div
        className="h-1 w-full transition-all duration-300"
        style={{ background: `linear-gradient(90deg, ${unit.color}, ${unit.accent})` }}
      />

      <div className="p-7 flex flex-col gap-4 flex-1">
        {/* Icon & Name */}
        <div className="flex items-start justify-between">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-300"
            style={{
              background: hovered ? "rgba(255, 255, 255, 1)" : `${unit.color}18`,
              backdropFilter: hovered ? "blur(8px)" : "none",
            }}
          >
            {unit.emoji}
          </div>
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1 text-white/90"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.78rem" }}
          >
            View Unit <ArrowRight size={13} />
          </motion.div>
        </div>

        {/* Text */}
        <div>
          <h3
            className="transition-colors duration-300"
            style={{
              fontFamily: "'Inter', serif",
              fontWeight: 700,
              fontSize: "1.45rem",
              color: hovered ? "#FFFFFF" : "#1A1210",
              lineHeight: 1.2,
            }}
          >
            {unit.name}
          </h3>
          <p
            className="mt-0.5 transition-colors duration-300"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "0.78rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: hovered ? "rgba(255,255,255,0.7)" : unit.color,
            }}
          >
            {unit.tagline}
          </p>
        </div>

        <p
          className="transition-colors duration-300 flex-1"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: "0.875rem",
            lineHeight: 1.7,
            color: hovered ? "rgba(255,255,255,0.85)" : "#6B5E59",
          }}
        >
          {unit.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-auto">
          {unit.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full transition-all duration-300"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "0.7rem",
                background: hovered ? "rgba(255,255,255,0.18)" : `${unit.color}14`,
                color: hovered ? "rgba(255,255,255,0.9)" : unit.color,
                border: `1px solid ${hovered ? "rgba(255,255,255,0.25)" : `${unit.color}30`}`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function Units() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="units" className="py-28 relative overflow-hidden" style={{ background: "#FDFAF4" }}>
      {/* Background decoration */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #C8962C40, transparent)" }} />
      <div
        className="absolute top-20 right-0 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8962C20, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
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
              background: "linear-gradient(135deg, #A47251, #A47251)",
              color: "#ffffff",
              border: "1px solid #ffffff",
            }}
          >
            Five Pillars of Expression
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
            Explore the Five{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, #9B1B2E, #C8962C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Creative Units
            </span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto text-[#6B5E59]"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "1rem", lineHeight: 1.75 }}
          >
            Each unit is a dedicated community for a distinct art form — united by a shared passion for Filipino culture and creativity.
          </p>
        </motion.div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {units.slice(0, 3).map((unit, i) => (
            <UnitCard key={unit.id} unit={unit} index={i} />
          ))}
          {/* Bottom row: 2 cards centered */}
          <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5 lg:w-2/3 lg:mx-auto">
            {units.slice(3).map((unit, i) => (
              <UnitCard key={unit.id} unit={unit} index={i + 3} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
