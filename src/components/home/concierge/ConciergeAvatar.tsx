import { motion, useReducedMotion } from "framer-motion";

interface Props {
  size?: number;
  /** Show the emerald "online" dot. */
  showStatus?: boolean;
  /** Faster, stronger breathe/aura — used while the concierge is thinking. */
  pulsing?: boolean;
  className?: string;
}

/**
 * The concierge's face: the BLANC bottle emblem on a dark disc with a soft gold
 * aura that breathes. Opacity here is a plain keyframe array in `animate` (never a
 * bound MotionValue), so it's safe under the page-transition opacity variant.
 */
const ConciergeAvatar = ({ size = 32, showStatus = false, pulsing = false, className = "" }: Props) => {
  const reduce = useReducedMotion();
  const duration = pulsing ? 2 : 3.2;
  const loop = reduce ? undefined : { duration, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Gold aura */}
      <motion.span
        aria-hidden
        animate={reduce ? { opacity: 0.4 } : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.18, 1] }}
        transition={loop}
        className="absolute inset-0 rounded-full bg-[hsl(36_45%_48%/0.5)] blur-md"
      />
      {/* Emblem disc — breathes */}
      <motion.span
        animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
        transition={loop}
        className="relative w-full h-full rounded-full bg-foreground flex items-center justify-center overflow-hidden ring-1 ring-white/10"
      >
        <img src="/favicon.png" alt="BLANC concierge" className="w-3/4 h-3/4 object-contain brightness-0 invert" />
      </motion.span>
      {showStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
      )}
    </span>
  );
};

export default ConciergeAvatar;
