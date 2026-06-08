import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { closeChat } from "@/store/slices/assistantSlice";

const AssistantProductResults = () => {
  const ids = useAppSelector((s) => s.assistant.lastProductIds);
  const items = useAppSelector((s) => s.products.items);
  const dispatch = useAppDispatch();

  if (!ids.length) return null;
  const products = ids.map((id) => items.find((p) => p.id === id)).filter(Boolean);
  if (!products.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
      {products.map((p) => p && (
        <Link key={p.id} to={`/product/${p.slug || p.id}`} onClick={() => dispatch(closeChat())} className="group block text-left">
          <div className="aspect-[3/4] overflow-hidden bg-secondary rounded-lg mb-2">
            <img
              src={p.images?.[0] || p.image || ""}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <h4 className="font-display text-sm tracking-wide truncate">{p.name}</h4>
          <p className="text-[11px] font-body text-muted-foreground truncate">{p.tagline}</p>
          <p className="text-[11px] font-body text-foreground/70">From ₹{p.price.toLocaleString("en-IN")}</p>
        </Link>
      ))}
    </div>
  );
};

export default AssistantProductResults;
