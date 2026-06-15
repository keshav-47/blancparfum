import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeChat } from "@/store/slices/assistantSlice";

const AssistantProductResults = () => {
  const ids = useAppSelector((s) => s.assistant.lastProductIds);
  const items = useAppSelector((s) => s.products.items);
  const dispatch = useAppDispatch();
  const reduce = useReducedMotion();

  if (!ids.length) return null;
  const products = ids.map((id) => items.find((p) => p.id === id)).filter(Boolean);
  if (!products.length) return null;

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4"
    >
      {products.map((p) => p && (
        <motion.div
          key={p.id}
          variants={{
            hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 160, damping: 20 } },
          }}
          whileHover={reduce ? undefined : { y: -4 }}
        >
          <Link
            to={`/product/${p.slug || p.id}`}
            onClick={() => dispatch(closeChat())}
            className="group block text-left rounded-xl p-1.5 ring-1 ring-transparent hover:ring-accent/40 hover:bg-background/60 transition-all"
          >
            <div className="aspect-[3/4] overflow-hidden bg-secondary rounded-lg mb-2 shadow-[0_6px_20px_-10px_rgba(0,0,0,0.3)]">
              <img
                src={p.images?.[0] || p.image || ""}
                alt={p.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-110"
              />
            </div>
            <h4 className="font-display text-sm tracking-wide truncate px-0.5">{p.name}</h4>
            <p className="text-[11px] font-body text-muted-foreground truncate px-0.5">{p.tagline}</p>
            <p className="text-[11px] font-body text-foreground/70 px-0.5">From ₹{p.price.toLocaleString("en-IN")}</p>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AssistantProductResults;
