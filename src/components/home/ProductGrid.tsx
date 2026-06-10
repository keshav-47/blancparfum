import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";

const COUNT = 15; // 5×3 on desktop, 3×5 on mobile

// Three staged beats (one per swipe):
//   A — the first (centre) image rises in from the bottom of the screen.
//   B — a second image rises in from the bottom, stacking beside it.
//   C — every remaining tile bursts out from BEHIND the stack to its grid slot.
const PHASE_A: [number, number] = [0.05, 0.3];
const PHASE_B: [number, number] = [0.38, 0.6];
const PHASE_C: [number, number] = [0.68, 0.95];

const Tile = ({
  src,
  name,
  slug,
  index,
  cols,
  progress,
  reduce,
}: {
  src: string;
  name: string;
  slug: string;
  index: number;
  cols: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) => {
  const rows = COUNT / cols;
  const r = Math.floor(index / cols);
  const dx = (index % cols) - Math.floor((cols - 1) / 2); // tile-widths from centre
  const dy = r - Math.floor((rows - 1) / 2);

  const isFirst = dx === 0 && dy === 0; // centre tile — beat A
  const isSecond = dx === 1 && dy === 0; // right of centre — beat B
  // Far enough below the pinned stage to be fully off-screen for this row.
  const below = `${(rows - r) * 100 + 30}%`;

  const x = useTransform(
    progress,
    isFirst ? PHASE_A : PHASE_C,
    reduce || isFirst ? ["0%", "0%"] : [isSecond ? "-90%" : `${-dx * 100}%`, "0%"],
  );
  const y = useTransform(
    progress,
    isFirst ? PHASE_A : isSecond ? PHASE_B : PHASE_C,
    reduce ? ["0%", "0%"] : isFirst || isSecond ? [below, "0%"] : [`${-dy * 100}%`, "0%"],
  );
  // The rest stay hidden (scale 0) behind the stack until just before beat C.
  const scale = useTransform(
    progress,
    [PHASE_C[0] - 0.06, PHASE_C[0] - 0.01],
    reduce || isFirst || isSecond ? [1, 1] : [0, 1],
  );

  const z = isFirst ? COUNT + 2 : isSecond ? COUNT + 1 : COUNT - (Math.abs(dx) + Math.abs(dy));

  return (
    <motion.div style={{ x, y, scale, zIndex: z }} className="relative will-change-transform">
      <Link to={`/product/${slug}`} className="group relative block w-full h-full overflow-hidden rounded-lg md:rounded-xl shadow-lg shadow-black/15">
        <img
          src={src}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
        />
        {/* Name + hover affordance */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
        <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 flex items-center justify-between gap-2">
          <span className="font-display text-xs md:text-sm text-white leading-tight truncate transition-transform duration-500 group-hover:-translate-y-0.5">
            {name}
          </span>
          <ArrowUpRight size={15} className="shrink-0 text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  );
};

const ProductGrid = () => {
  const products = useAppSelector((s) => s.products.items);
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();
  const isMobile = useIsMobile();
  // Mobile: 3×5 layout (bigger tiles) and a much shorter track so roughly one
  // swipe carries the whole grow + fly-out; desktop keeps the long cinematic scrub.
  const cols = isMobile ? 3 : 5;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const sprung = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.3 });
  const progress = reduce ? scrollYProgress : sprung;

  // Headline reads first, recedes as the collage spreads over it.
  const headOpacity = useTransform(progress, [0.05, 0.26], [1, 0]);
  useMotionValueEvent(headOpacity, "change", (v) => {
    if (headRef.current) headRef.current.style.opacity = v.toFixed(3);
  });

  const withImg = products.filter((p) => p.images?.[0] || p.image);
  if (!withImg.length) return null;
  const tiles = Array.from({ length: COUNT }, (_, i) => {
    const p = withImg[i % withImg.length];
    return { src: (p.images?.[0] || p.image) as string, name: p.name, slug: p.slug || p.id };
  });

  return (
    <>
      {/* Track sized so each beat (first image · second image · burst) gets
          roughly one swipe on mobile and a comfortable scrub on desktop. */}
      <section id="product-grid" ref={trackRef} className="relative bg-background" style={{ height: isMobile ? "300vh" : "360vh" }}>
        {/* Pinned below the floating header (top-24) with a shorter stage, so the
            top row clears the header and the tiles are a touch smaller. */}
        <div className="sticky top-20 md:top-24 h-[calc(100vh-9rem)] md:h-[calc(100vh-12rem)] overflow-hidden">
          {/* Collage: tiles stack at the centre then fly out — capped to the header width */}
          <div className="absolute inset-0 flex justify-center px-3 sm:px-4 md:px-6">
            <div className="w-full max-w-[1600px] h-full grid grid-cols-3 md:grid-cols-5 auto-rows-fr gap-2 md:gap-4">
              {tiles.map((t, i) => (
                <Tile key={i} src={t.src} name={t.name} slug={t.slug} index={i} cols={cols} progress={progress} reduce={reduce} />
              ))}
            </div>
          </div>

          {/* Headline — shown first, fades as the first image rises */}
          <div ref={headRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <span className="h-px w-10 md:w-16 bg-accent" />
              <p className="text-[11px] md:text-xs font-body font-bold uppercase tracking-[0.45em] text-accent">Discover</p>
              <span className="h-px w-10 md:w-16 bg-accent" />
            </div>
            <h2 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-foreground leading-[1.02]">
              Our <span className="italic text-accent">Fragrances</span>
            </h2>
            <p className="mt-4 md:mt-6 max-w-md md:max-w-lg font-body text-sm md:text-lg text-muted-foreground">
              Handcrafted extraits, each with a story to tell — keep scrolling to unveil them.
            </p>
          </div>
        </div>
      </section>

      {/* View all — below the section, also giving breathing room before the footer */}
      <div className="bg-background flex justify-center py-16 md:py-24">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2.5 text-[11px] font-body font-medium uppercase tracking-[0.2em] text-foreground border border-foreground/25 rounded-full px-9 py-3.5 hover:bg-foreground hover:text-background transition-colors"
        >
          View all fragrances
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </>
  );
};

export default ProductGrid;
