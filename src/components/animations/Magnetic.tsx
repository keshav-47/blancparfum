import { useRef, useState, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** How strongly the element follows the cursor (0–1). */
  strength?: number;
}

/**
 * Wraps an inline element (button/link) so it gently follows the cursor on
 * hover, then springs back. Disabled under prefers-reduced-motion.
 */
const Magnetic = ({ children, className, strength = 0.25 }: MagneticProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const [pos, setPos] = useState({ x: 0, y: 0 });

  if (reduce) {
    return <span className={`inline-block ${className ?? ""}`}>{children}</span>;
  }

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    setPos({
      x: (e.clientX - (left + width / 2)) * strength,
      y: (e.clientY - (top + height / 2)) * strength,
    });
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`inline-block ${className ?? ""}`}
    >
      {children}
    </motion.span>
  );
};

export default Magnetic;
