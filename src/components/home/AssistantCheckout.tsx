import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, MapPin, Plus, CheckCircle2, Loader2 } from "lucide-react";
import MotionCard from "./concierge/MotionCard";
import { Button } from "@/components/ui/button";
import AddressForm, { emptyAddress } from "@/components/AddressForm";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserProfile, addAddress, updateAddress } from "@/store/slices/userSlice";
import { fetchServerCart } from "@/store/slices/cartSlice";
import { clearPendingAction, clearProductResults, pushAssistantNote, closeChat } from "@/store/slices/assistantSlice";
import { useCheckout } from "@/hooks/useCheckout";
import { toast } from "@/hooks/use-toast";
import type { Address } from "@/types";
import type { AssistantAction } from "@/api/assistantApi";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const btn = "rounded-full text-[11px] uppercase tracking-[0.15em] h-10 font-body font-medium";

const Card = MotionCard;

// Gold sparkle burst for the order-success moment (fixed angles → no randomness).
const SPARKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return { x: Math.cos(a) * 34, y: Math.sin(a) * 34, d: 0.04 * i };
});

/**
 * The concierge's in-chat checkout: cart review + delivery address + "place order".
 * Shared by the view_cart / select_address / place_order actions. Placing the order
 * runs the exact same flow as the Cart page (useCheckout): create order → open the
 * secure Razorpay modal → verify. We never handle payment details here.
 */
const AssistantCheckout = ({ action }: { action: AssistantAction }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const items = useAppSelector((s) => s.cart.items);
  const profile = useAppSelector((s) => s.user.profile);
  const { placeOrder } = useCheckout();
  const reduce = useReducedMotion();

  const addresses = profile?.addresses ?? [];
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const [selectedId, setSelectedId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<"idle" | "paying" | "verifying" | "done">("idle");

  // Pull a fresh cart + addresses so the summary the user confirms is accurate.
  useEffect(() => {
    if (isAuthenticated) {
      if (!profile) dispatch(fetchUserProfile());
      dispatch(fetchServerCart());
    }
  }, [isAuthenticated, profile, dispatch]);

  // Default the selection to the agent's hint, else the default, else the first.
  useEffect(() => {
    if (selectedId || addresses.length === 0) return;
    const hint = action.addressId ? addresses.find((a) => a.id === action.addressId) : undefined;
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    setSelectedId((hint ?? def)?.id ?? "");
  }, [addresses, action.addressId, selectedId]);

  const dismiss = () => dispatch(clearPendingAction());
  // Declines acknowledge + keep the chat alive rather than silently clearing the card.
  const decline = (msg: string) => { dispatch(pushAssistantNote(msg)); dispatch(clearPendingAction()); };

  // ── Success (a small celebration) ─────────────────────────────────────────
  if (phase === "done") {
    return (
      <Card>
        <div className="flex flex-col items-center text-center py-2">
          <div className="relative inline-flex items-center justify-center mb-3">
            {!reduce && SPARKS.map((s, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute w-1 h-1 rounded-full bg-accent"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], x: s.x, y: s.y, scale: [0, 1, 0.4] }}
                transition={{ duration: 0.9, delay: 0.1 + s.d, ease: "easeOut" }}
              />
            ))}
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={reduce ? undefined : { type: "spring", stiffness: 300, damping: 14, delay: 0.05 }}
              className="text-emerald-600"
            >
              <CheckCircle2 size={30} />
            </motion.span>
          </div>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-xl mb-1"
          >
            Order confirmed
          </motion.p>
          <p className="text-sm font-body text-muted-foreground mb-4">
            Payment received — thank you. You'll get a confirmation shortly.
          </p>
          <Button onClick={() => { dismiss(); dispatch(closeChat()); navigate("/profile"); }} className={btn}>
            View my orders
          </Button>
        </div>
      </Card>
    );
  }

  // ── Guests must sign in first ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Card>
        <p className="text-sm font-body mb-3">Sign in to place your order.</p>
        <div className="flex gap-2">
          <Button onClick={() => { dismiss(); dispatch(closeChat()); navigate(`/login?returnTo=${encodeURIComponent("/?concierge=open")}`); }} className={btn}>
            Sign in
          </Button>
          <Button variant="outline" onClick={() => decline("No worries — keep browsing, and sign in whenever you're ready to check out.")} className={btn}>Not now</Button>
        </div>
      </Card>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <ShoppingBag size={16} className="text-muted-foreground" />
          <p className="text-sm font-body font-medium">Your cart is empty</p>
        </div>
        <p className="text-sm font-body text-muted-foreground mb-3">Tell me what you're after and I'll find your scent.</p>
        <Button variant="outline" onClick={() => decline("Sure — tell me a vibe (fresh, woody, a gift…) and I'll pull a few scents.")} className={btn}>Keep browsing</Button>
      </Card>
    );
  }

  const placing = phase !== "idle";
  const isSelectOnly = action.type === "select_address";

  // select_address is "choose where to ship" without paying now — persist the
  // pick as the default so the next "place my order" uses it, then hand back to chat.
  const useThisAddress = async () => {
    const addr = addresses.find((a) => a.id === selectedId);
    if (!addr) {
      toast({ title: "Choose a delivery address", variant: "destructive" });
      return;
    }
    try {
      if (!addr.isDefault) await dispatch(updateAddress({ ...addr, isDefault: true })).unwrap();
      dispatch(pushAssistantNote(`Got it — I'll ship to your ${addr.label} address. Say "place my order" whenever you're ready.`));
      dispatch(clearPendingAction());
    } catch {
      toast({ title: "Couldn't update address", variant: "destructive" });
    }
  };

  const pay = () => {
    if (!selectedId) {
      toast({ title: "Choose a delivery address", variant: "destructive" });
      return;
    }
    setPhase("paying");
    placeOrder(selectedId, {
      // Closing Razorpay without paying: snap the button back AND acknowledge in-chat
      // (the card stays, so they can try again) — not a silent revert.
      onDismiss: () => {
        setPhase("idle");
        dispatch(pushAssistantNote("Payment cancelled — no charge was made. Your order's still here whenever you'd like to try again."));
      },
      onVerifying: () => setPhase("verifying"),
      onSuccess: () => {
        setPhase("done");
        dispatch(clearProductResults()); // don't leave the product image under the success card
        dispatch(pushAssistantNote("Your order is confirmed — payment received. Anything else I can help you find?"));
        toast({ title: "Order placed!", description: "Thank you for your purchase." });
      },
      onError: (msg) => {
        setPhase("idle");
        toast({ title: msg, variant: "destructive" });
        // Surface the failure in the transcript too (toasts fade) + offer a retry.
        dispatch(pushAssistantNote(`I couldn't complete that — ${msg} Want to try placing the order again?`));
      },
    });
  };

  const title =
    action.type === "view_cart" ? "Your cart"
    : action.type === "select_address" ? "Choose delivery address"
    : "Review & place your order";

  return (
    <Card>
      <p className="text-[11px] font-body font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">{title}</p>

      {/* Cart summary */}
      <div className="space-y-2 mb-4">
        {items.map((i, idx) => (
          <motion.div
            key={`${i.productId}-${i.size}`}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduce ? 0 : idx * 0.05 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-12 rounded-md bg-secondary overflow-hidden shrink-0">
              {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-body truncate">{i.name}</p>
              <p className="text-[11px] font-body text-muted-foreground">{i.size}ml × {i.quantity}</p>
            </div>
            <p className="text-sm font-body font-medium whitespace-nowrap">{inr(i.price * i.quantity)}</p>
          </motion.div>
        ))}
        <div className="flex justify-between text-sm font-body border-t border-border pt-2 mt-1">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-accent font-medium">Free</span>
        </div>
        <div className="flex justify-between text-sm font-body font-semibold">
          <span>Total</span>
          <span>{inr(subtotal)}</span>
        </div>
      </div>

      {/* Delivery address */}
      <div className="mb-4">
        <p className="text-[11px] font-body font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2 flex items-center gap-1.5">
          <MapPin size={12} /> Deliver to
        </p>

        {addresses.length === 0 || showForm ? (
          <AddressForm
            value={addrForm}
            onChange={setAddrForm}
            saving={saving}
            submitLabel="Save & use this address"
            // Collapse back to the saved list when adding extra; when there are no
            // addresses yet, back out of the whole card WITH an acknowledgement.
            onCancel={showForm && addresses.length > 0
              ? () => setShowForm(false)
              : () => decline("No problem — I'll skip the address for now. Say \"place my order\" whenever you'd like to add one and check out.")}
            onSubmit={async () => {
              setSaving(true);
              try {
                const saved = await dispatch(addAddress(addrForm)).unwrap();
                setSelectedId(saved.id);
                setShowForm(false);
                setAddrForm(emptyAddress);
                toast({ title: "Address saved" });
              } catch {
                toast({ title: "Couldn't save address", variant: "destructive" });
              } finally {
                setSaving(false);
              }
            }}
          />
        ) : (
          <div className="space-y-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => setSelectedId(addr.id)}
                className={`w-full text-left p-3 rounded-xl border transition-colors ${
                  selectedId === addr.id ? "border-foreground bg-secondary/50" : "border-border hover:border-foreground/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-body font-medium flex items-center gap-2">
                      {addr.label}
                      {addr.isDefault && (
                        <span className="text-[9px] uppercase tracking-[0.1em] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">Default</span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-body mt-0.5 leading-relaxed truncate">
                      {addr.street}, {addr.city}, {addr.state} {"–"} {addr.zip}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${selectedId === addr.id ? "border-foreground bg-foreground" : "border-border"}`} />
                </div>
              </button>
            ))}
            <button
              onClick={() => { setShowForm(true); setAddrForm(emptyAddress); }}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground font-body font-medium uppercase tracking-[0.12em] py-1 transition-colors"
            >
              <Plus size={13} /> Add a new address
            </button>
          </div>
        )}
      </div>

      {/* Primary action — "use this address" for a pure address pick, else place the order */}
      {!showForm && addresses.length > 0 && (
        <div className="flex gap-2">
          {isSelectOnly ? (
            <Button onClick={useThisAddress} disabled={!selectedId} className={btn}>Use this address</Button>
          ) : (
            <Button onClick={pay} disabled={placing || !selectedId} className={`${btn} gap-2`}>
              {placing ? (
                <><Loader2 size={14} className="animate-spin" /> {phase === "verifying" ? "Confirming…" : "Opening payment…"}</>
              ) : (
                <>Place order {"·"} {inr(subtotal)}</>
              )}
            </Button>
          )}
          {!placing && (
            <Button
              variant="outline"
              onClick={() => decline(isSelectOnly
                ? "No problem — I'll keep your current delivery address. Anything else?"
                : "No problem — I've kept your cart. Say \"place my order\" whenever you're ready, or ask me anything else.")}
              className={btn}
            >
              Not now
            </Button>
          )}
        </div>
      )}
      {!showForm && !isSelectOnly && (
        <p className="text-[10px] font-body text-muted-foreground mt-3">
          Secure payment via Razorpay. We never see your card details.
        </p>
      )}
    </Card>
  );
};

export default AssistantCheckout;
