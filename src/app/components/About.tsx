import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { CheckCircle2, Globe, Heart, Users } from "lucide-react";

const artImg = "https://images.unsplash.com/photo-1767330855561-d96ee7dbbd99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBzdHVkZW50cyUyMGNyZWF0aXZpdHklMjB3b3Jrc2hvcCUyMHBhaW50aW5nfGVufDF8fHx8MTc3NjE0MzY0M3ww&ixlib=rb-4.1.0&q=80&w=1080";

const highlights = [
  { icon: <Users className="bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000] bg-[#00000000]" size={15} />, text: "Community-driven organization for Filipino student artists" },
  { icon: <Globe size={15} />, text: "Preserving and promoting living Filipino cultural heritage" },
  { icon: <Heart size={15} />, text: "Nurturing creativity, leadership, and cultural pride" },
  { icon: <CheckCircle2 className="bg-[#10090900] bg-[#120a0a00] bg-[#160b0b00] bg-[#1c0d0d00] bg-[#210d0d00] bg-[#210d0d00]" size={15} />, text: "Structured programs across five major art disciplines" },
];

const stats = [
  { value: "5", label: "Creative Units" },
  { value: "500+", label: "Active Members" },
  { value: "50+", label: "Annual Programs" },
  { value: "10+", label: "Years of Legacy" },
];

export function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const imgRef = useRef(null);
  const imgInView = useInView(imgRef, { once: true, margin: "-60px" });

  return (
    <section id="about" className="py-28 relative overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #9B1B2E40, transparent)" }} />

      {/* Background elements */}
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #C8962C30, transparent)" }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Image Column */}
          <motion.div
            ref={imgRef}
            initial={{ opacity: 0, x: -40 }}
            animate={imgInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            {/* Decorative squares */}
            <div
              className="absolute -top-6 -left-6 w-24 h-24 rounded-xl z-0"
              style={{ background: "linear-gradient(135deg, #9B1B2E18, #C8962C18)", border: "1px solid #C8962C20" }}
            />
            <div
              className="absolute -bottom-6 -right-6 w-32 h-32 rounded-xl z-0"
              style={{ background: "linear-gradient(135deg, #C8962C18, #E0703A18)", border: "1px solid #C8962C20" }}
            />

            {/* Main image */}
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: "4/5" }}>
              <img
                src={artImg}
                alt="Students in arts workshop"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(155,27,46,0.35) 0%, transparent 60%)" }}
              />
            </div>

            {/* Floating stat card */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-8 -right-4 lg:-right-10 z-20"
            >
              <div
                className="px-5 py-4 rounded-2xl shadow-xl"
                style={{
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(200,150,44,0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: "linear-gradient(135deg, #9B1B2E, #C8962C)" }}
                  >
                    🌺
                  </div>
                  <div>
                    <p className="text-[#1A1210]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: "0.9rem" }}>
                      Est. 2014
                    </p>
                    <p className="text-[#6B5E59]" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.72rem" }}>
                      Decade of Culture
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <div className="absolute -bottom-12 left-0 right-0 z-20 flex justify-center gap-0 lg:hidden">
              {stats.map((s, i) => (
                <div key={i} className="flex-1 text-center py-3 bg-white first:rounded-l-xl last:rounded-r-xl border-y border-r border-amber-100 first:border-l">
                  <p className="text-[#A47251]" style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.2rem" }}>{s.value}</p>
                  <p className="text-[#A47251]" style={{ fontFamily: "'Inter', serif", fontSize: "0.65rem" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Text Column */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="order-1 lg:order-2 flex flex-col gap-7"
          >
            {/* Label */}
            <span
              className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full"
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffffff]" />
              About EsKultura
            </span>

            {/* Heading */}
            <h2
              style={{
                fontFamily: "'Inter', serif",
                fontWeight: 800,
                fontSize: "clamp(1.9rem, 3.5vw, 2.75rem)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#1A1210",
              }}
            >
              Where Filipino{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(135deg, #9B1B2E, #C8962C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Culture Lives
              </span>{" "}
              and Thrives
            </h2>

            <div className="flex flex-col gap-4">
              <p
                className="text-[#6B5E59]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.975rem", lineHeight: 1.8 }}
              >
                EsKultura: Eskuwelahan ng Manlililok ng Kulturang Pilipino — is a group of students composed of different units that showcase and promote art and culture within LSPU Los Baños Campus. Each of its units, Ritmo Eskultura, Himig Eskultura, Likha Eskultura, Teatro Eskultura, and Likha Eskultura, aims to bring life and meaning to various forms of art.
              </p>
              <p
                className="text-[#6B5E59]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "0.975rem", lineHeight: 1.8 }}
              >
                The overall goal of EsKultura, the School of Cultural Creators of Filipino Culture, is to establish a vibrant and thriving culture of art and heritage both inside and outside the university. The organization aims to serve as a center for development, performance, and promotion of the importance of Filipino culture in the lives of students.
              </p>
            </div>

            {/* Highlight list */}
            <div className="flex flex-col gap-3">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[#9B1B2E]"
                    style={{ background: "#9B1B2E12" }}
                  >
                    {h.icon}
                  </div>
                  <span
                    className="text-[#2D2320]"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.9rem" }}
                  >
                    {h.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Desktop stats */}
            <div className="hidden lg:grid grid-cols-4 gap-4 pt-2">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  className="text-center py-4 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #FDF8F4, #FFF5EE)", border: "1px solid #C8962C20" }}
                >
                  <p
                    className="text-[#9B1B2E]"
                    style={{ fontFamily: "'Inter', serif", fontWeight: 800, fontSize: "1.6rem" }}
                  >
                    {s.value}
                  </p>
                  <p
                    className="text-[#6B5E59] mt-0.5"
                    style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.72rem" }}
                  >
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
