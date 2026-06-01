import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

interface BottleSVGProps {
  /** Liquid level 0–1. Pass a MotionValue to drive it from scroll. */
  fill?: MotionValue<number>;
  className?: string;
  /** Unique id so multiple bottles don't share clip/gradient defs. */
  uid?: string;
}

// Shouldered flacon silhouette.
const BODY =
  "M64,150 C64,126 80,118 100,118 C120,118 136,126 136,150 L136,296 C136,310 128,318 112,318 L88,318 C72,318 64,310 64,296 Z";

/**
 * Transparent, fully-vector perfume flacon — no background, animatable.
 * The golden liquid level can be driven by a scroll MotionValue.
 */
const BottleSVG = ({ fill, className, uid = "bp" }: BottleSVGProps) => {
  const fallback = useMotionValue(0.6);
  const level = fill ?? fallback;

  // Interior spans y ≈ 118 (under shoulder) → 318 (base): 200 units tall.
  const liquidH = useTransform(level, [0, 1], [0, 200]);
  const liquidY = useTransform(liquidH, (h) => 318 - h);

  const clip = `${uid}-clip`;
  const glass = `${uid}-glass`;
  const cap = `${uid}-cap`;
  const sheen = `${uid}-sheen`;

  return (
    <svg viewBox="0 0 200 360" className={className} fill="none">
      <defs>
        <clipPath id={clip}><path d={BODY} /></clipPath>
        <linearGradient id={glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={cap} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a342c" />
          <stop offset="100%" stopColor="#15110b" />
        </linearGradient>
        <linearGradient id={sheen} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="24%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="332" rx="58" ry="7" fill="hsl(var(--foreground))" opacity="0.08" />

      {/* Cap + gold band + neck */}
      <rect x="80" y="44" width="40" height="40" rx="8" fill={`url(#${cap})`} />
      <rect x="82" y="84" width="36" height="6" rx="2" fill="hsl(var(--accent))" />
      <rect x="88" y="90" width="24" height="30" fill={`url(#${glass})`} stroke="hsl(var(--foreground) / 0.45)" strokeWidth="1.5" />

      {/* Glass body */}
      <path d={BODY} fill={`url(#${glass})`} />

      {/* Liquid (clipped to the body, fills from the bottom) */}
      <motion.rect x="58" width="84" height={liquidH} y={liquidY} clipPath={`url(#${clip})`} fill="hsl(var(--accent))" opacity="0.9" />
      <motion.rect x="58" width="84" height="2.5" y={liquidY} clipPath={`url(#${clip})`} fill="#fff" opacity="0.4" />

      {/* Sheen + outline */}
      <path d={BODY} fill={`url(#${sheen})`} clipPath={`url(#${clip})`} />
      <path d={BODY} stroke="hsl(var(--foreground) / 0.5)" strokeWidth="1.75" />

      {/* Label */}
      <rect x="72" y="198" width="56" height="52" rx="3" fill="hsl(var(--background) / 0.92)" stroke="hsl(var(--foreground) / 0.2)" strokeWidth="1" />
      <text x="100" y="220" textAnchor="middle" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: 16, letterSpacing: 2 }} fill="hsl(var(--foreground))">BLANC</text>
      <line x1="86" y1="227" x2="114" y2="227" stroke="hsl(var(--accent))" strokeWidth="0.75" />
      <text x="100" y="240" textAnchor="middle" style={{ fontFamily: "Inter, sans-serif", fontSize: 6, letterSpacing: 3 }} fill="hsl(var(--foreground) / 0.65)">PARFUM</text>
    </svg>
  );
};

export default BottleSVG;
