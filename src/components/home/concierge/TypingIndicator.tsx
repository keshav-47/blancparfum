import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ConciergeAvatar from "./ConciergeAvatar";

const PHRASES = ["thinking…", "finding your scent…", "curating picks…"];

/**
 * "Alive" thinking state: the breathing avatar + a gold wave of dots + a rotating
 * status line. Replaces the plain three-dot bounce.
 */
const TypingIndicator = () => {
  const reduce = useReducedMotion();
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setPhrase((p) => (p + 1) % PHRASES.length), 1900);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="flex items-end gap-2">
      <ConciergeAvatar size={26} pulsing />
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2.5">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-accent/70"
              animate={reduce ? undefined : { y: [0, -3, 0] }}
              transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={reduce ? "static" : phrase}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.25 }}
            className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground"
          >
            {reduce ? "thinking…" : PHRASES[phrase]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypingIndicator;
