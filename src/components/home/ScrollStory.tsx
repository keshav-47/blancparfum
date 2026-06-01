import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import BottleSVG from "./BottleSVG";
import Magnetic from "@/components/animations/Magnetic";

const NOTES = ["Bergamot", "Taif Rose", "Oud", "Amber", "Vetiver"];
const RADIUS = 178;

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

/** A bottle in the finale line-up that slides out from centre. */
const FanBottle = ({ offset, spread, opacity }: { offset: number; spread: MotionValue<number>; opacity: MotionValue<number> }) => {
  const x = useTransform(spread, [0, 1], [0, offset]);
  return (
    <motion.div style={{ x, opacity }} className="absolute">
      <BottleSVG uid={`fan${offset}`} className="h-[26vh] max-h-[230px] w-auto opacity-90" />
    </motion.div>
  );
};

const ScrollStory = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Central bottle — fades in, then shrinks into the centre of the finale line-up
  const bottleOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.25, 0.74, 0.9], [0.72, 1, 1, 0.46]);
  const bottleY = useTransform(scrollYProgress, [0, 0.15], [60, 0]);
  const bottleRotate = useTransform(scrollYProgress, [0.28, 0.66, 0.9], [-5, 5, 0]);
  const fill = useTransform(scrollYProgress, [0.14, 0.52], [0, 1]);

  // Orbiting notes (phase 2)
  const ringRotate = useTransform(scrollYProgress, [0.2, 0.7], [-25, 35]);
  const ringOpacity = useTransform(scrollYProgress, [0.28, 0.38, 0.6, 0.68], [0, 1, 1, 0]);

  // Text phases
  const t1 = useTransform(scrollYProgress, [0.02, 0.1, 0.22, 0.3], [0, 1, 1, 0]);
  const t2 = useTransform(scrollYProgress, [0.36, 0.44, 0.56, 0.64], [0, 1, 1, 0]);
  const t3 = useTransform(scrollYProgress, [0.74, 0.84, 1, 1], [0, 1, 1, 1]);
  const t1y = useTransform(scrollYProgress, [0.02, 0.3], [20, -20]);
  const t2y = useTransform(scrollYProgress, [0.36, 0.64], [20, -20]);

  // Finale fan of bottles
  const fanOpacity = useTransform(scrollYProgress, [0.74, 0.86], [0, 1]);
  const fanSpread = useTransform(scrollYProgress, [0.74, 0.98], [0, 1]);

  return (
    <section ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Accent glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] max-w-[640px] max-h-[640px] rounded-full bg-accent/10 blur-[130px]" />

        {/* Orbiting scent notes */}
        <motion.div style={{ rotate: ringRotate, opacity: ringOpacity }} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative w-0 h-0">
            {NOTES.map((n, i) => (
              <OrbitNote key={n} label={n} angle={(i / NOTES.length) * 360} ringRotate={ringRotate} />
            ))}
          </div>
        </motion.div>

        {/* Central bottle */}
        <motion.div style={{ opacity: bottleOpacity, scale: bottleScale, y: bottleY, rotate: bottleRotate }} className="relative z-10">
          <BottleSVG fill={fill} uid="hero" className="h-[56vh] max-h-[520px] w-auto drop-shadow-2xl" />
        </motion.div>

        {/* Finale: a line-up of bottles fanning out */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FanBottle offset={-300} spread={fanSpread} opacity={fanOpacity} />
          <FanBottle offset={-150} spread={fanSpread} opacity={fanOpacity} />
          <FanBottle offset={150} spread={fanSpread} opacity={fanOpacity} />
          <FanBottle offset={300} spread={fanSpread} opacity={fanOpacity} />
        </div>

        {/* Text phases */}
        <motion.p style={{ opacity: t1, y: t1y }} className="absolute bottom-[16%] left-0 right-0 text-center px-6 font-display text-3xl md:text-5xl font-light">
          Composed, drop by drop
        </motion.p>
        <motion.p style={{ opacity: t2, y: t2y }} className="absolute bottom-[16%] left-0 right-0 text-center px-6 font-display text-3xl md:text-5xl font-light">
          Aged until it <span className="text-accent">lingers</span>
        </motion.p>
        <motion.div style={{ opacity: t3 }} className="absolute bottom-[12%] left-0 right-0 flex flex-col items-center gap-6 px-6 text-center">
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
        <motion.div style={{ opacity: t1 }} className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-body uppercase tracking-[0.35em] text-muted-foreground">
          Scroll to discover
        </motion.div>
      </div>
    </section>
  );
};

export default ScrollStory;
