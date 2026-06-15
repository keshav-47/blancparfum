import { motion, useReducedMotion } from "framer-motion";
import type { AssistantRole } from "@/api/assistantApi";
import ConciergeAvatar from "./ConciergeAvatar";
import StreamingText from "./StreamingText";

interface Props {
  role: AssistantRole;
  content: string;
  /** This is the newest assistant message and should reveal word-by-word. */
  streaming: boolean;
  /** Show the avatar (only on the first of a consecutive assistant run). */
  showAvatar: boolean;
  onReveal?: () => void;
  onDone?: () => void;
}

/**
 * A single chat bubble. Assistant bubbles are warm + paired with the avatar and
 * stream their text; user bubbles are the dark fill, right-aligned. Entrance is a
 * gentle directional spring (opacity via props, transforms safe).
 */
const MessageBubble = ({ role, content, streaming, showAvatar, onReveal, onDone }: Props) => {
  const reduce = useReducedMotion();
  const isUser = role === "user";

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, x: isUser ? 12 : -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 150, damping: 20 }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span className="shrink-0 w-[26px] self-end mb-0.5">
          {showAvatar ? <ConciergeAvatar size={26} /> : null}
        </span>
      )}
      <div
        className={
          isUser
            ? "max-w-[82%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm font-body leading-relaxed bg-foreground text-background shadow-[0_4px_14px_-6px_rgba(0,0,0,0.35)]"
            : "max-w-[82%] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm font-body leading-relaxed bg-secondary text-foreground border border-border/60 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.2)]"
        }
      >
        {isUser ? content : <StreamingText text={content} streaming={streaming} onReveal={onReveal} onDone={onDone} />}
      </div>
    </motion.div>
  );
};

export default MessageBubble;
