import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { dismissError } from "@/store/slices/assistantSlice";
import MessageBubble from "./concierge/MessageBubble";
import TypingIndicator from "./concierge/TypingIndicator";

const AssistantMessageList = ({ onStreamReveal }: { onStreamReveal?: () => void }) => {
  const { messages, status, error } = useAppSelector((s) => s.assistant);
  const dispatch = useAppDispatch();
  // Messages that have finished revealing — they render full text instantly so we
  // never re-animate old turns when the list re-renders. Keyed by array index, so
  // it MUST be cleared when the conversation resets ("New chat" empties messages
  // without unmounting this component) — otherwise the new chat's reused low
  // indices collide with stale ones and the streaming reveal silently stops.
  const seen = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (messages.length === 0) seen.current.clear();
  }, [messages.length]);

  // The newest assistant message is the only one that streams.
  let newestAssistant = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") { newestAssistant = i; break; }
  }

  return (
    <div className="space-y-3.5">
      {messages.map((m, i) => {
        const isAssistant = m.role === "assistant";
        // Avatar only on the first of a consecutive assistant run (less clutter).
        const showAvatar = isAssistant && (i === 0 || messages[i - 1].role !== "assistant");
        const streaming = isAssistant && i === newestAssistant && status !== "loading" && !seen.current.has(i);
        return (
          <MessageBubble
            key={i}
            role={m.role}
            content={m.content}
            streaming={streaming}
            showAvatar={showAvatar}
            onReveal={onStreamReveal}
            onDone={() => seen.current.add(i)}
          />
        );
      })}

      {status === "loading" && <TypingIndicator />}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-[12px] text-destructive font-body py-1 text-center"
        >
          <span>{error}</span>
          <button onClick={() => dispatch(dismissError())} className="underline hover:no-underline">dismiss</button>
        </motion.div>
      )}
    </div>
  );
};

export default AssistantMessageList;
