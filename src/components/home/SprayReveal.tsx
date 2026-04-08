import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Mist particles that spray outward from center
const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 300,
  y: (Math.random() - 0.5) * 200 - 100,
  scale: Math.random() * 0.6 + 0.4,
  delay: Math.random() * 0.5,
  duration: Math.random() * 1.5 + 1,
}));

const SprayReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className="relative flex flex-col items-center py-12 overflow-hidden">
      {/* Perfume bottle silhouette */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10"
      >
        <svg
          width="48" height="80" viewBox="0 0 48 80" fill="none"
          className="text-foreground/15"
        >
          {/* Bottle cap */}
          <rect x="18" y="0" width="12" height="8" rx="2" fill="currentColor" />
          {/* Nozzle */}
          <rect x="22" y="8" width="4" height="6" fill="currentColor" />
          {/* Bottle body */}
          <path d="M10 20 C10 16 16 14 24 14 C32 14 38 16 38 20 L38 70 C38 75 32 78 24 78 C16 78 10 75 10 70 Z" fill="currentColor" />
          {/* Label line */}
          <rect x="16" y="38" width="16" height="1" rx="0.5" fill="white" opacity="0.4" />
          <rect x="18" y="42" width="12" height="1" rx="0.5" fill="white" opacity="0.3" />
        </svg>
      </motion.div>

      {/* Spray mist particles */}
      {isInView && particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-8 left-1/2"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.4, 0],
            x: p.x,
            y: p.y,
            scale: p.scale,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay + 0.5,
            ease: "easeOut",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-accent/20 blur-sm" />
        </motion.div>
      ))}

      {/* Spray line */}
      <motion.div
        initial={{ scaleY: 0, opacity: 0 }}
        animate={isInView ? { scaleY: 1, opacity: [0, 0.3, 0] } : {}}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
        className="w-[1px] h-16 bg-gradient-to-b from-accent/40 to-transparent origin-top -mt-2"
      />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="text-[10px] font-body uppercase tracking-[0.3em] text-muted-foreground mt-4"
      >
        Sprayed with passion
      </motion.p>
    </div>
  );
};

export default SprayReveal;
