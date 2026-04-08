import { motion, useInView } from "framer-motion";
import { useRef } from "react";

// Mist particles — varied sizes and directions
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 400,
  y: -(Math.random() * 200 + 40),
  size: Math.random() * 12 + 6,
  delay: Math.random() * 0.6,
  duration: Math.random() * 1.2 + 0.8,
  opacity: Math.random() * 0.3 + 0.15,
}));

// Droplet trails
const droplets = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: (Math.random() - 0.5) * 120,
  y: -(Math.random() * 80 + 30),
  delay: Math.random() * 0.3 + 0.2,
}));

const SprayReveal = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="relative flex flex-col items-center py-8 overflow-visible">
      {/* Spray mist cloud */}
      {isInView && particles.map((p) => (
        <motion.div
          key={`mist-${p.id}`}
          className="absolute"
          style={{ top: "50%", left: "50%" }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
          animate={{
            opacity: [0, p.opacity, 0],
            x: p.x,
            y: p.y,
            scale: [0, 1.5, 2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
        >
          <div
            className="rounded-full bg-accent/30 blur-md"
            style={{ width: p.size, height: p.size }}
          />
        </motion.div>
      ))}

      {/* Fine droplets */}
      {isInView && droplets.map((d) => (
        <motion.div
          key={`drop-${d.id}`}
          className="absolute"
          style={{ top: "50%", left: "50%" }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            x: d.x,
            y: d.y,
          }}
          transition={{ duration: 0.6, delay: d.delay, ease: "easeOut" }}
        >
          <div className="w-1 h-1 rounded-full bg-accent" />
        </motion.div>
      ))}

      {/* Central spray burst */}
      {isInView && (
        <motion.div
          className="absolute"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.2, 0], scale: [0, 3, 5] }}
          transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
        >
          <div className="w-16 h-16 rounded-full bg-accent/20 blur-xl" />
        </motion.div>
      )}

      {/* Perfume bottle */}
      <motion.svg
        width="40" height="72" viewBox="0 0 40 72" fill="none"
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        {/* Cap */}
        <rect x="14" y="0" width="12" height="6" rx="1.5" fill="#1a1a1a" opacity="0.7" />
        {/* Nozzle */}
        <rect x="18" y="6" width="4" height="5" fill="#1a1a1a" opacity="0.5" />
        {/* Shoulder */}
        <path d="M12 15 C12 12 16 11 20 11 C24 11 28 12 28 15 L28 18 L12 18 Z" fill="#1a1a1a" opacity="0.15" />
        {/* Body */}
        <rect x="8" y="18" width="24" height="46" rx="3" fill="#1a1a1a" opacity="0.1" />
        {/* Glass shine */}
        <rect x="12" y="22" width="2" height="38" rx="1" fill="#1a1a1a" opacity="0.06" />
        {/* Label */}
        <rect x="14" y="34" width="12" height="0.5" fill="#1a1a1a" opacity="0.15" />
        <rect x="16" y="37" width="8" height="0.5" fill="#1a1a1a" opacity="0.1" />
        {/* Bottom */}
        <path d="M8 64 L8 60 L32 60 L32 64 C32 67 28 68 20 68 C12 68 8 67 8 64 Z" fill="#1a1a1a" opacity="0.08" />
      </motion.svg>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={isInView ? { opacity: 1, letterSpacing: "0.3em" } : {}}
        transition={{ duration: 1, delay: 1 }}
        className="text-[9px] font-body uppercase text-muted-foreground/60 mt-6"
      >
        Crafted with passion
      </motion.p>
    </div>
  );
};

export default SprayReveal;
