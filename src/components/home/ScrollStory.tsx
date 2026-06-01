import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import BottlePhoto from "./BottlePhoto";
import Magnetic from "@/components/animations/Magnetic";

const NOTES = ["Bergamot", "Taif Rose", "Oud", "Amber", "Vetiver"];
const RADIUS = 160;

/** A scent-note chip orbiting on the ring, kept upright as the ring rotates. */
const OrbitNote = ({ label, angle, ringRotate }: { label: string; angle: number; ringRotate: MotionValue<number> }) => {
  const counter = useTransform(ringRotate, (r) => -(angle + r));
  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${angle}deg) translate(0px, ${-RADIUS}px)` }}>
      <motion.span
        style={{ rotate: counter }}
        className="block -translate-x-1/2 whitespace-nowrap text-[10px] md:text-[11px] font-body uppercase tracking-[0.2em] text-foreground/70 bg-background/70 backdrop-blur-sm border border-border/60 rounded-full px-3 py-1.5 shadow-sm"
      >
        {label}
      </motion.span>
    </div>
  );
};

/** A bottle in the finale line-up that slides out from centre (responsive vw offset). */
const SideBottle = ({ offsetVw, out, opacity }: { offsetVw: number; out: MotionValue<number>; opacity: MotionValue<number> }) => {
  const x = useTransform(out, [0, 1], ["0vw", `${offsetVw}vw`]);
  return (
    <motion.div style={{ x, opacity }} className="absolute">
      <BottlePhoto className="h-[24vh] max-h-[230px] w-auto object-contain" />
    </motion.div>
  );
};

const ScrollStory = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Central bottle — always on screen; fades in, fills, then settles small for the finale.
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.18, 0.62, 0.76], [0.82, 1, 1, 0.6]);
  const bottleY = useTransform(scrollYProgress, [0, 0.12], [50, 0]);
  const bottleRotate = useTransform(scrollYProgress, [0.2, 0.58, 0.76], [-4, 4, 0]);

  // Orbiting notes (mid phase)
  const ringRotate = useTransform(scrollYProgress, [0.16, 0.64], [-22, 30]);
  const ringOpacity = useTransform(scrollYProgress, [0.22, 0.32, 0.52, 0.6], [0, 1, 1, 0]);

  // Finale line-up
  const sideOut = useTransform(scrollYProgress, [0.62, 0.92], [0, 1]);
  const sideOpacity = useTransform(scrollYProgress, [0.62, 0.78], [0, 1]);

  // Text phases (continuous — one is always visible)
  const t1 = useTransform(scrollYProgress, [0.02, 0.08, 0.2, 0.27], [0, 1, 1, 0]);
  const t2 = useTransform(scrollYProgress, [0.3, 0.38, 0.5, 0.58], [0, 1, 1, 0]);
  const t3 = useTransform(scrollYProgress, [0.64, 0.74, 1, 1], [0, 1, 1, 1]);
  const t1y = useTransform(scrollYProgress, [0.02, 0.27], [16, -16]);
  const t2y = useTransform(scrollYProgress, [0.3, 0.58], [16, -16]);

  return (
    <section ref={ref} className="relative h-[240vh] bg-background">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Accent glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[600px] max-h-[600px] rounded-full bg-accent/10 blur-[130px]" />

        {/* Orbiting scent notes */}
        <motion.div style={{ rotate: ringRotate, opacity: ringOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-0 h-0">
            {NOTES.map((n, i) => (
              <OrbitNote key={n} label={n} angle={(i / NOTES.length) * 360} ringRotate={ringRotate} />
            ))}
          </div>
        </motion.div>

        {/* Finale line-up (slides out from behind the central bottle) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <SideBottle offsetVw={-34} out={sideOut} opacity={sideOpacity} />
          <SideBottle offsetVw={-17} out={sideOut} opacity={sideOpacity} />
          <SideBottle offsetVw={17} out={sideOut} opacity={sideOpacity} />
          <SideBottle offsetVw={34} out={sideOut} opacity={sideOpacity} />
        </div>

        {/* Central bottle */}
        <motion.div style={{ opacity: bottleOpacity, scale: bottleScale, y: bottleY, rotate: bottleRotate }} className="relative z-10">
          <BottlePhoto className="h-[50vh] max-h-[480px] w-auto object-contain" />
        </motion.div>

        {/* Text phases */}
        <motion.p style={{ opacity: t1, y: t1y }} className="absolute bottom-[12%] left-0 right-0 text-center px-6 font-display text-3xl md:text-5xl font-light">
          Composed, drop by drop
        </motion.p>
        <motion.p style={{ opacity: t2, y: t2y }} className="absolute bottom-[12%] left-0 right-0 text-center px-6 font-display text-3xl md:text-5xl font-light">
          Aged until it <span className="text-accent">lingers</span>
        </motion.p>
        <motion.div style={{ opacity: t3 }} className="absolute bottom-[10%] left-0 right-0 flex flex-col items-center gap-5 px-6 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-light">The BLANC Collection</h2>
          <Magnetic strength={0.35}>
            <Link
              to="/shop"
              className="group inline-flex items-center gap-3 text-[11px] font-body font-medium uppercase tracking-[0.25em] text-background bg-foreground rounded-full px-8 py-4 hover:bg-foreground/90 transition-colors"
            >
              Explore the Collection
              <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Magnetic>
        </motion.div>

        {/* Scroll hint (start only) */}
        <motion.div style={{ opacity: t1 }} className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-body uppercase tracking-[0.35em] text-muted-foreground">
          Scroll to discover
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollStory;
