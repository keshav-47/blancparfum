import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTypewriter } from "@/hooks/useTypewriter";

interface Props {
  text: string;
  /** Animate the reveal (this is the newest message and motion is allowed). */
  streaming: boolean;
  /** Fired as words reveal — used to keep the chat pinned to the bottom. */
  onReveal?: () => void;
  /** Fired once the reveal completes (so the parent can mark it "seen"). */
  onDone?: () => void;
}

/**
 * Word-by-word reveal of an already-received reply, with a blinking gold caret —
 * a frontend-only simulation of streaming. Reduced motion / non-newest messages
 * render the full text instantly.
 */
const StreamingText = ({ text, streaming, onReveal, onDone }: Props) => {
  const reduce = useReducedMotion();
  const enabled = streaming && !reduce;
  const { words, shown, done } = useTypewriter(text, { enabled, onTick: onReveal });

  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);

  if (!enabled) return <>{text}</>;

  const prior = words.slice(0, Math.max(0, shown - 1)).join(" ");
  const last = shown > 0 ? words[shown - 1] : "";

  return (
    <>
      {prior}
      {prior && shown > 1 ? " " : ""}
      {last && (
        <motion.span key={shown} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.16 }}>
          {last}
        </motion.span>
      )}
      {!done && (
        <motion.span
          aria-hidden
          className="inline-block w-[2px] h-[1em] ml-0.5 -mb-[2px] align-middle bg-accent rounded-full"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </>
  );
};

export default StreamingText;
