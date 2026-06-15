import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Shared elevated surface for the in-chat action / checkout cards. Springs in
 * (opacity via initial/animate props — safe; transforms are safe) instead of
 * hard-cutting. Replaces the old flat `Wrap` / `Card` divs.
 */
const MotionCard = ({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 150, damping: 22, delay }}
      className={`mt-4 rounded-2xl border border-border bg-background/80 backdrop-blur p-4 text-left shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)] ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default MotionCard;
