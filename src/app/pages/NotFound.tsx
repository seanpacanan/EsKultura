import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #FDFAF4, #FFF8EE)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Decorative bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 14 }, (_, col) => {
              const x = col * 60 + (row % 2 === 0 ? 0 : 30);
              const y = row * 60;
              return <rect key={`${row}-${col}`} x={x} y={y} width="20" height="20" rx="2" transform={`rotate(45 ${x + 10} ${y + 10})`} fill="#9B1B2E" />;
            })
          )}
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-center max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="20" cy="20" r="19" fill="#9B1B2E" />
              <circle cx="20" cy="20" r="19" stroke="#C8962C" strokeWidth="1.5" />
              <path d="M14 26L20 10L26 26" stroke="#FDFDF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16.5 20.5H23.5" stroke="#C8962C" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M20 26V30" stroke="#C8962C" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="31" r="1" fill="#C8962C" />
            </svg>
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Inter', serif",
            fontWeight: 800,
            fontSize: "6rem",
            lineHeight: 1,
            backgroundImage: "linear-gradient(135deg, #9B1B2E, #C8962C)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </h1>

        <h2
          className="mt-4 text-[#1A1210]"
          style={{ fontFamily: "'Inter', serif", fontWeight: 700, fontSize: "1.5rem" }}
        >
          Page Not Found
        </h2>

        <p className="mt-3 text-[#6B5E59]" style={{ fontSize: "0.95rem", lineHeight: 1.7 }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to EsKultura.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            style={{ background: "linear-gradient(135deg, #9B1B2E, #7D1525)" }}
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-xl font-semibold border border-[#9B1B2E] text-[#9B1B2E] hover:bg-[#9B1B2E]/5 transition-all"
          >
            Go Back
          </button>
        </div>

        <p
          className="mt-10 text-[#6B5E59]/30 italic"
          style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.95rem" }}
        >
          "Sining · Kultura · Paglikha"
        </p>
      </motion.div>
    </div>
  );
}
