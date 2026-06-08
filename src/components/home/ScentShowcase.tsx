import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";

/**
 * "Discover" showcase (advanced-sticky style). A headline sits behind a product
 * collage that starts as a small focused cluster in the centre and SCALES UP into
 * a full-bleed grid as you scroll, then releases. Scale is a transform (safe on a
 * motion element); the headline opacity is applied imperatively (binding an
 * opacity MotionValue to a motion element collides with the page-transition
 * variant and crashes WAAPI).
 */
const ScentShowcase = () => {
  const products = useAppSelector((s) => s.products.items);
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const reduce = !!useReducedMotion();

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const sprung = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.3 });
  const progress = reduce ? scrollYProgress : sprung;

  // Collage grows from a centred cluster to a full-bleed grid.
  const scale = useTransform(progress, [0, 0.9], reduce ? [1, 1] : [0.34, 1.06]);
  // Headline reads first, then recedes as the collage expands over it.
  const headOpacity = useTransform(progress, [0, 0.32], [1, 0]);
  useMotionValueEvent(headOpacity, "change", (v) => {
    if (headRef.current) headRef.current.style.opacity = v.toFixed(3);
  });

  // Real product shots; repeat to fill the collage if the catalog is small.
  const shots = products.map((p) => p.images?.[0] || p.image).filter(Boolean) as string[];
  if (!shots.length) return null;
  const tiles = Array.from({ length: 15 }, (_, i) => shots[i % shots.length]);

  return (
    <div ref={trackRef} className="relative bg-foreground" style={{ height: "260vh" }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center">
        {/* Headline behind the collage */}
        <div ref={headRef} className="absolute z-10 px-6 text-center pointer-events-none">
          <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Discover</p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-background leading-[1.05] max-w-3xl mx-auto">
            A scent for <span className="italic">every story</span>
          </h2>
        </div>

        {/* Expanding collage */}
        <motion.div style={{ scale }} className="relative z-20 w-full origin-center will-change-transform">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 px-2 md:px-3">
            {tiles.map((src, i) => (
              <Link key={i} to="/shop" className="group block aspect-[3/4] overflow-hidden rounded-lg md:rounded-xl bg-secondary/20">
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScentShowcase;
