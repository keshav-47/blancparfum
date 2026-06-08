import { useRef } from "react";
import { Link } from "react-router-dom";
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

const COLS = 5;
const ROWS = 3;
const COUNT = COLS * ROWS; // 15
const CC = Math.floor((COLS - 1) / 2); // centre column
const CR = Math.floor((ROWS - 1) / 2); // centre row

// Reveal order: centre tile first, then spreading outward.
const REVEAL_ORDER = (() => {
  const ranked = Array.from({ length: COUNT }, (_, i) => ({
    i,
    d: Math.abs(Math.floor(i / COLS) - CR) + Math.abs((i % COLS) - CC),
  })).sort((a, b) => a.d - b.d);
  const order = new Array<number>(COUNT);
  ranked.forEach((t, rank) => (order[t.i] = rank));
  return order;
})();

const Tile = ({
  src,
  slug,
  index,
  progress,
  reduce,
}: {
  src: string;
  slug: string;
  index: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) => {
  const c = index % COLS;
  const r = Math.floor(index / COLS);
  const dx = c - CC; // tile-widths from centre
  const dy = r - CR;
  const order = REVEAL_ORDER[index];

  // All tiles first STACK at the centre (behind the centre image), then fly out
  // to their real grid slot — staggered centre-out, so they "emerge from behind"
  // the first image rather than fading in independently.
  const flyStart = order === 0 ? 1 : 0.18 + (order / (COUNT - 1)) * 0.58;
  const x = useTransform(progress, [flyStart, flyStart + 0.16], reduce ? ["0%", "0%"] : [`${-dx * 100}%`, "0%"]);
  const y = useTransform(progress, [flyStart, flyStart + 0.16], reduce ? ["0%", "0%"] : [`${-dy * 100}%`, "0%"]);
  // The stack grows in at the centre first (so the headline reads, then one image).
  const scale = useTransform(progress, [0.06, 0.16], reduce ? [1, 1] : [0, 1]);

  return (
    <motion.div style={{ x, y, scale, zIndex: COUNT - order }} className="relative will-change-transform">
      <Link to={`/product/${slug}`} className="group block w-full h-full overflow-hidden rounded-lg md:rounded-xl shadow-xl shadow-black/30">
        <img
          src={src}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>
    </motion.div>
  );
};

const ProductGrid = () => {
  const products = useAppSelector((s) => s.products.items);
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

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
    return { src: (p.images?.[0] || p.image) as string, slug: p.slug || p.id };
  });

  return (
    <section id="product-grid" ref={trackRef} className="relative bg-foreground" style={{ height: "340vh" }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Collage: tiles stack at the centre, then fly out to fill the screen */}
        <div className="absolute inset-0 grid grid-cols-5 auto-rows-fr gap-2 md:gap-3 p-2 md:p-3">
          {tiles.map((t, i) => (
            <Tile key={i} src={t.src} slug={t.slug} index={i} progress={progress} reduce={reduce} />
          ))}
        </div>

        {/* Headline — shown first, fades as the images spread */}
        <div ref={headRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.35em] text-accent mb-4">Discover</p>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-background leading-[1.02]">
            Our Fragrances
          </h2>
        </div>

        {/* View all */}
        <Link
          to="/shop"
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40 inline-flex items-center gap-2 text-[11px] font-body font-medium uppercase tracking-[0.2em] text-background/85 hover:text-background bg-foreground/40 backdrop-blur px-5 py-2.5 rounded-full border border-background/20 transition-colors"
        >
          View all fragrances →
        </Link>
      </div>
    </section>
  );
};

export default ProductGrid;
