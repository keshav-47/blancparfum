import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItemToCart } from "@/store/slices/cartSlice";
import { clearPendingAction, pushAssistantNote } from "@/store/slices/assistantSlice";
import { toast } from "@/hooks/use-toast";
import AddressConfirm from "./AddressConfirm";

const Wrap = ({ children }: { children: ReactNode }) => (
  <div className="mt-4 rounded-2xl border border-border bg-background/80 backdrop-blur p-4 text-left">{children}</div>
);

const btn = "rounded-full text-[11px] uppercase tracking-[0.15em] h-10 font-body font-medium";

const AssistantActionBar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const action = useAppSelector((s) => s.assistant.pendingAction);
  const items = useAppSelector((s) => s.products.items);
  const [busy, setBusy] = useState(false);

  if (!action || action.type === "none") return null;

  const product = action.productId ? items.find((p) => p.id === action.productId) : undefined;
  const dismiss = () => dispatch(clearPendingAction());

  if (action.type === "add_to_cart") {
    const confirm = async () => {
      setBusy(true);
      try {
        await dispatch(addItemToCart({
          productId: action.productId!,
          name: product?.name ?? "",
          image: product?.images?.[0] ?? product?.image ?? "",
          size: action.sizeMl ?? 30,
          price: action.unitPrice ?? product?.price ?? 0,
          quantity: action.quantity ?? 1,
        })).unwrap();
        toast({ title: `${product?.name ?? "Item"} added to cart` });
        dispatch(pushAssistantNote("Added to your cart — anything else?"));
        dispatch(clearPendingAction());
      } catch (err: unknown) {
        toast({ title: typeof err === "string" ? err : "Couldn't add to cart", variant: "destructive" });
      } finally {
        setBusy(false);
      }
    };
    return (
      <Wrap>
        <p className="text-sm font-body mb-3">
          Add <span className="font-medium">{product?.name ?? "this fragrance"}</span>
          {action.sizeMl ? ` (${action.sizeMl}ml)` : ""}
          {action.unitPrice ? ` — ₹${action.unitPrice.toLocaleString("en-IN")}` : ""} to your cart?
        </p>
        <div className="flex gap-2">
          <Button onClick={confirm} disabled={busy} className={btn}>{busy ? "Adding…" : "Add to cart"}</Button>
          <Button variant="outline" onClick={dismiss} className={btn}>Not now</Button>
        </div>
      </Wrap>
    );
  }

  if (action.type === "go_to_checkout") {
    return (
      <Wrap>
        <p className="text-sm font-body mb-3">Ready to checkout?</p>
        <div className="flex gap-2">
          <Button onClick={() => { dismiss(); navigate("/cart"); }} className={btn}>Go to cart</Button>
          <Button variant="outline" onClick={dismiss} className={btn}>Not now</Button>
        </div>
      </Wrap>
    );
  }

  if (action.type === "sign_in") {
    return (
      <Wrap>
        <p className="text-sm font-body mb-3">You'll need to sign in to continue.</p>
        <div className="flex gap-2">
          <Button onClick={() => { dismiss(); navigate("/login?returnTo=/"); }} className={btn}>Sign in</Button>
          <Button variant="outline" onClick={dismiss} className={btn}>Not now</Button>
        </div>
      </Wrap>
    );
  }

  if (action.type === "add_address") {
    return <Wrap><AddressConfirm draft={action.address} /></Wrap>;
  }

  return null;
};

export default AssistantActionBar;
