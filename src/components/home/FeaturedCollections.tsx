import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion, type MotionValue } from "framer-motion";
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
  const span = 1 / total;
  const start = index * span;
  const end = (index + 1) * span;
  const fade = span * 0.32;
  const imageLeft = index % 2 === 0;

  const out0 = index === 0 ? 1 : 0;
  const out3 = index === total - 1 ? 1 : 0;
  const opacity = useTransform(progress, [start - fade, start + fade, end - fade, end + fade], [out0, 1, 1, out3]);

  const ref = useRef<HTMLDivElement>(null);
  useMotionValueEvent(opacity, "change", (v) => {
    if (ref.current) ref.current.style.opacity = v.toFixed(3);
  });
  useEffect(() => {
    if (ref.current) ref.current.style.opacity = opacity.get().toFixed(3);
  }, [opacity]);

  // Gentle opposing drift through the panel window (transforms are safe).
  const imgX = useTransform(progress, [start, end], reduce ? ["0%", "0%"] : imageLeft ? ["-5%", "5%"] : ["5%", "-5%"]);
  const txtX = useTransform(progress, [start, end], reduce ? ["0%", "0%"] : imageLeft ? ["7%", "-7%"] : ["-7%", "7%"]);
  const imgScale = useTransform(progress, [start, end], reduce ? [1, 1] : [1.08, 1]);

  return (
    <div ref={ref} style={{ opacity: out0 }} className="absolute inset-0 flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-14 items-center">
        <motion.div style={{ x: imgX }} className={imageLeft ? "md:order-1" : "md:order-2"}>
          <div className="relative h-[34vh] md:h-[56vh] w-full overflow-hidden rounded-2xl bg-secondary shadow-2xl shadow-black/10">
            <motion.img
              src={col.image}
              alt={col.name}
              loading="lazy"
              style={{ scale: imgScale }}
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
          </div>
        </motion.div>

        <motion.div style={{ x: txtX }} className={imageLeft ? "md:order-2 md:pl-2" : "md:order-1 md:pr-2"}>
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
        </motion.div>
      </div>
    </div>
  );
};

const FeaturedCollections = () => {
  const collections = useAppSelector((s) => s.products.collections);
  const targetRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });

  const total = collections.length;
  if (!total) return null;

  return (
    <div ref={targetRef} className="relative" style={{ height: `${total * 100}vh` }}>
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
          <CollectionPanel key={col.id} col={col} index={i} total={total} progress={scrollYProgress} reduce={reduce} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCollections;
