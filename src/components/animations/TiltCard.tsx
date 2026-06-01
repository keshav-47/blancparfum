import { useRef, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
}

/**
 * Subtle 3D tilt that tracks the cursor across the card. Springs back to flat
 * on leave. Disabled under prefers-reduced-motion.
 */
const TiltCard = ({ children, className, max = 6 }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const px = useMotionValue(0); // -0.5 .. 0.5
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), { stiffness: 150, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), { stiffness: 150, damping: 18 });

  if (reduce) return <div className={className}>{children}</div>;

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    px.set((e.clientX - left) / width - 0.5);
    py.set((e.clientY - top) / height - 0.5);
  };
  const reset = () => { px.set(0); py.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 900, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default TiltCard;
