import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

// Body interior geometry (used for the liquid fill + clip).
const BODY = { x: 52, y: 120, w: 96, h: 176, rx: 18 };

interface BottleSVGProps {
  /** Liquid level 0–1. Pass a MotionValue to drive it from scroll. */
  fill?: MotionValue<number>;
  className?: string;
  /** Unique id so multiple bottles don't share clip/gradient defs. */
  uid?: string;
}

/**
 * Transparent, fully-vector perfume flacon — no background, animatable.
 * The golden liquid level can be driven by a scroll MotionValue.
 */
const BottleSVG = ({ fill, className, uid = "bp" }: BottleSVGProps) => {
  const fallback = useMotionValue(0.62);
  const level = fill ?? fallback;

  const liquidH = useTransform(level, [0, 1], [0, BODY.h]);
  const liquidY = useTransform(liquidH, (h) => BODY.y + BODY.h - h);

  const clipId = `${uid}-body`;
  const sheenId = `${uid}-sheen`;

  return (
    <svg viewBox="0 0 200 340" className={className} fill="none">
      <defs>
        <clipPath id={clipId}>
          <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={BODY.rx} />
        </clipPath>
        <linearGradient id={sheenId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="35%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Cap + collar + neck */}
      <rect x="82" y="48" width="36" height="40" rx="5" fill="hsl(var(--foreground))" />
      <rect x="84" y="86" width="32" height="10" fill="hsl(var(--foreground))" opacity="0.85" />
      <rect x="88" y="94" width="24" height="30" fill="hsl(var(--foreground) / 0.06)" stroke="hsl(var(--foreground) / 0.5)" strokeWidth="2" />

      {/* Glass body */}
      <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={BODY.rx} fill="hsl(var(--foreground) / 0.04)" />

      {/* Liquid (clipped to the body, fills from the bottom) */}
      <motion.rect
        x={BODY.x}
        width={BODY.w}
        height={liquidH}
        y={liquidY}
        clipPath={`url(#${clipId})`}
        fill="hsl(var(--accent))"
        opacity="0.88"
      />
      {/* Liquid surface line */}
      <motion.rect x={BODY.x} width={BODY.w} height="2.5" y={liquidY} clipPath={`url(#${clipId})`} fill="#fff" opacity="0.35" />

      {/* Glass outline + sheen */}
      <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={BODY.rx} stroke="hsl(var(--foreground) / 0.55)" strokeWidth="2" />
      <rect x={BODY.x} y={BODY.y} width={BODY.w} height={BODY.h} rx={BODY.rx} fill={`url(#${sheenId})`} clipPath={`url(#${clipId})`} />

      {/* Label */}
      <rect x="70" y="188" width="60" height="54" rx="4" fill="hsl(var(--background) / 0.9)" stroke="hsl(var(--foreground) / 0.25)" strokeWidth="1" />
      <text x="100" y="210" textAnchor="middle" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 15, letterSpacing: 2 }} fill="hsl(var(--foreground))">BLANC</text>
      <text x="100" y="226" textAnchor="middle" style={{ fontFamily: "Inter, sans-serif", fontSize: 6.5, letterSpacing: 3 }} fill="hsl(var(--foreground) / 0.7)">PARFUM</text>
    </svg>
  );
};

export default BottleSVG;
