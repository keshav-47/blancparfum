import { useEffect, useRef, useState } from "react";

interface Options {
  /** When false (reduced motion, or not the newest message) the full text shows instantly. */
  enabled: boolean;
  /** Milliseconds per word. */
  tickMs?: number;
  /** Fired each time a word is revealed — used to keep the chat scrolled to the bottom. */
  onTick?: () => void;
}

/**
 * Reveals `text` word-by-word to simulate live typing. The full reply is already
 * known (the backend returns one JSON, not a stream) — this just animates its
 * appearance. Resets when the text identity changes.
 */
export function useTypewriter(text: string, { enabled, tickMs = 38, onTick }: Options) {
  const words = text.length ? text.split(" ") : [];
  const [count, setCount] = useState(enabled ? 0 : words.length);

  // Stable ref so the interval effect doesn't restart every render.
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!enabled) {
      setCount(words.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      onTickRef.current?.();
      if (i >= words.length) clearInterval(id);
    }, tickMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, tickMs]);

  const shown = enabled ? Math.min(count, words.length) : words.length;
  return { words, shown, done: shown >= words.length };
}
