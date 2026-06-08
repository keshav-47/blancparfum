import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import type { Collection } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One cross-fading panel within the pinned stage. The fade opacity is applied
 * IMPERATIVELY to a plain <div> (not a motion component): binding an `opacity`
 * MotionValue to a motion element's style makes this framer-motion build spin up
 * a WAAPI "accelerated" animation at mount whose keyframe offsets are malformed
 * ("Offsets must be monotonically non-decreasing") and crash. Transform drift
 * (x / scale) is safe through motion components, so those stay declarative.
 */
const CollectionPanel = ({
  col,
  index,
  total,
  progress,
  reduce,
}: {
  col: Collection;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) => {
  // Map N collections across N+1 "units" of scroll so the first and last get a
  // lead-in / lead-out and centre comfortably INSIDE the pinned range (centres
  // at 1/(N+1) … N/(N+1)). Otherwise the first/last only peak at the exact
  // instant the section pins/unpins, so scrolling up you miss #1 and scrolling
  // down you miss the last.
  const units = total + 1;
  const span = 1 / units;
  const center = (index + 1) * span;

  // Each collection HOLDS fully visible across the middle of its window; the
  // fades are longer now (smoother) but hold + fade still === half a span, so
  // adjacent panels meet at the boundary (both at 0) — the outgoing collection
  // is gone before the incoming one appears (no two-up "double exposure"). The
  // first stays solid from the top and the last stays solid until the unpin.
  const hold = span * 0.30;
  const fade = span * 0.20;
  // Shared keyframe window: fade-in · hold · fade-out.
  const win = [center - hold - fade, center - hold, center + hold, center + hold + fade];
  const out0 = index === 0 ? 1 : 0;
  const outLast = index === total - 1 ? 1 : 0;
  const opacity = useTransform(progress, win, [out0, 1, 1, outLast]);

  const ref = useRef<HTMLDivElement>(null);
  // Only the visible panel should catch clicks — otherwise the stacked
  // (invisible) panels on top swallow them and the "Explore" link is dead.
  const apply = (v: number) => {
    if (!ref.current) return;
    ref.current.style.opacity = v.toFixed(3);
    ref.current.style.pointerEvents = v > 0.5 ? "auto" : "none";
  };
  useMotionValueEvent(opacity, "change", apply);
  useEffect(() => {
    apply(opacity.get());
  }, [opacity]); // eslint-disable-line react-hooks/exhaustive-deps

  // Card motion: each collection RISES up from below as it fades in, holds at
  // rest, then continues up as it fades out — a bottom-to-top card. The first
  // doesn't rise in (already there at the top); the last doesn't rise out.
  // (Transform MotionValues — unlike opacity — are safe on a motion element.)
  const RISE = 90; // px
  const y = useTransform(progress, win, reduce ? [0, 0, 0, 0] : [index === 0 ? 0 : RISE, 0, 0, index === total - 1 ? 0 : -RISE]);

  // 3D: the image frame tilts on its X axis as the card rises in / floats out
  // (perspective gives it depth — a card lifting toward you), then sits flat
  // during the hold. Plus a subtle zoom.
  const TILT = 16; // deg
  const rotateX = useTransform(progress, win, reduce ? [0, 0, 0, 0] : [index === 0 ? 0 : TILT, 0, 0, index === total - 1 ? 0 : -TILT]);
  const imgScale = useTransform(progress, [center - span / 2, center + span / 2], reduce ? [1, 1] : [1.07, 1]);

  return (
    <div ref={ref} style={{ opacity: out0, pointerEvents: out0 > 0.5 ? "auto" : "none" }} className="absolute inset-0 flex items-center">
      <motion.div style={{ y }} className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-14 items-center">
        <div style={{ perspective: 1200 }}>
          <motion.div
            style={{ rotateX, transformPerspective: 1200 }}
            className="relative h-[34vh] md:h-[56vh] w-full overflow-hidden rounded-2xl bg-secondary shadow-2xl shadow-black/20 will-change-transform"
          >
            <motion.img
              src={col.image}
              alt={col.name}
              loading="lazy"
              style={{ scale: imgScale }}
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </motion.div>
        </div>

        <div className="md:pl-2">
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3 md:mb-4">
            {pad(index + 1)} — Collection
          </p>
          <h3 className="font-display text-3xl md:text-6xl font-light leading-[1.03] mb-4 md:mb-5">{col.name}</h3>
          {col.description && (
            <p className="font-body text-sm md:text-base text-muted-foreground max-w-md mb-6 md:mb-8 leading-relaxed">
              {col.description}
            </p>
          )}
          <Link
            to={`/collection/${col.slug || col.id}`}
            className="group inline-flex items-center gap-2.5 text-[11px] font-body font-medium uppercase tracking-[0.22em] text-foreground"
          >
            <span className="border-b border-foreground/30 pb-1 group-hover:border-foreground transition-colors">
              Explore the collection
            </span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const FeaturedCollections = () => {
  const collections = useAppSelector((s) => s.products.collections);
  const targetRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  // A light spring smooths the scroll-linked motion (buttery rise / fade / tilt).
  const sprung = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.3 });
  const progress = reduce ? scrollYProgress : sprung;

  const total = collections.length;
  if (!total) return null;

  return (
    <div ref={targetRef} className="relative" style={{ height: `${(total + 1) * 100}vh` }}>
      {/* Pin the stage below the fixed navbar (h-16) so content centres in the visible area. */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
        {/* Lightweight section label, top-left */}
        <div className="absolute top-5 md:top-8 inset-x-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 flex items-center gap-3">
            <span className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent">Curated</span>
            <span className="h-px w-10 bg-border" />
            <span className="text-[10px] font-body uppercase tracking-[0.25em] text-muted-foreground">Collections</span>
          </div>
        </div>

        {collections.map((col, i) => (
          <CollectionPanel key={col.id} col={col} index={i} total={total} progress={progress} reduce={reduce} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCollections;
