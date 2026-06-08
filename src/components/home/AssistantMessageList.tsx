import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { dismissError } from "@/store/slices/assistantSlice";

const AssistantMessageList = () => {
  const { messages, status, error } = useAppSelector((s) => s.assistant);
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-3">
      {messages.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-body leading-relaxed ${
              m.role === "user" ? "bg-foreground text-background" : "bg-secondary text-foreground"
            }`}
          >
            {m.content}
          </div>
        </motion.div>
      ))}

      {status === "loading" && (
        <div className="flex justify-start">
          <div className="bg-secondary rounded-2xl px-4 py-3 flex gap-1">
            {[0, 150, 300].map((d) => (
              <span key={d} className="w-1.5 h-1.5 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-center text-[12px] text-destructive font-body py-1">
          {error}{" "}
          <button onClick={() => dispatch(dismissError())} className="underline hover:no-underline">dismiss</button>
        </div>
      )}
    </div>
  );
};

export default AssistantMessageList;
