import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, Star } from "lucide-react";

/* Decorative Filipino-inspired pattern SVG */
function PatternBg() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Diamond grid pattern */}
      {Array.from({ length: 12 }, (_, row) =>
        Array.from({ length: 20 }, (_, col) => {
          const x = col * 45 + (row % 2 === 0 ? 0 : 22.5);
          const y = row * 38;
          return (
            <rect
              key={`${row}-${col}`}
              x={x}
              y={y}
              width="18"
              height="18"
              rx="2"
              transform={`rotate(45 ${x + 9} ${y + 9})`}
              fill="white"
            />
          );
        })
      )}
      {/* Large decorative circles */}
      <circle cx="100" cy="200" r="80" stroke="white" strokeWidth="1" fill="none" strokeDasharray="6 8" />
      <circle cx="700" cy="200" r="100" stroke="white" strokeWidth="1" fill="none" strokeDasharray="6 8" />
      <circle cx="400" cy="200" r="120" stroke="white" strokeWidth="0.5" fill="none" />
    </svg>
  );
}

export function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-28 relative overflow-hidden" style={{ background: "#FDFAF4" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #9B1B2E 0%, #7D1525 30%, #5C0F1C 60%, #3A0710 100%)",
            boxShadow: "0 30px 80px -15px rgba(155,27,46,0.5), 0 10px 30px -10px rgba(0,0,0,0.3)",
          }}
        >
          {/* Background pattern */}
          <PatternBg />

          {/* Gold top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: "linear-gradient(90deg, #C8962C, #E0703A, #C8962C)" }}
          />

          {/* Side glows */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -left-20 w-60 h-60 rounded-full blur-3xl opacity-30"
            style={{ background: "#C8962C" }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-20 w-60 h-60 rounded-full blur-3xl opacity-20"
            style={{ background: "#E0703A" }}
          />

          {/* Content */}
          <div className="relative z-10 px-8 py-20 lg:py-24 text-center flex flex-col items-center gap-8">
            {/* Stars */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-1.5"
            >
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="#C8962C" className="text-[#C8962C]" />
              ))}
              <span
                className="ml-2 text-white/70"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: "0.82rem" }}
              >
                Trusted by Filipino student artists
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col gap-3"
            >
              <h2
                className="text-white max-w-3xl"
                style={{
                  fontFamily: "'Inter', serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                Start your journey in{" "}
                <span
                  style={{
                    backgroundImage: "linear-gradient(135deg, #C8962C, #E0703A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  shaping Filipino culture
                </span>
              </h2>
              <p
                className="text-white/70 max-w-xl mx-auto"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: "1.05rem", lineHeight: 1.75 }}
              >
                Join EsKultura today and become part of a vibrant community dedicated to preserving and advancing the rich artistic traditions of the Philippines.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-[#FFFFFF] font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #a47251, #a47251)",
                }}
              >
                Create an Account
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
              >
                Learn More
              </button>
            </motion.div>

            {/* Sub note */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-white/40"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8rem" }}
            >
              Free to join · No credit card required · For students only
            </motion.p>

            {/* Decorative baybayin-style text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-white/25 mt-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 400,
                fontSize: "1.1rem",
                letterSpacing: "0.3em",
                fontStyle: "italic",
              }}
            >
              Sining · Kultura · Paglikha
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
