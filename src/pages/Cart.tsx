import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ArrowLeft, MapPin, ChevronRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeItemFromCart, updateItemQuantity, clearCart, fetchServerCart } from "@/store/slices/cartSlice";
import { fetchUserProfile, addAddress } from "@/store/slices/userSlice";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";
import type { Address } from "@/types";

interface RazorpayOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { items } = useAppSelector((s) => s.cart);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const { profile } = useAppSelector((s) => s.user);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const emptyAddr: Omit<Address, "id"> = { label: "", street: "", city: "", state: "", zip: "", country: "India", isDefault: true };
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>(emptyAddr);

  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (!profile) dispatch(fetchUserProfile());
      dispatch(fetchServerCart());
    }
  }, [isAuthenticated, profile, dispatch]);

  const addresses = profile?.addresses ?? [];

  const openCheckout = () => {
    if (!isAuthenticated) { navigate("/login?returnTo=/cart"); return; }
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def) setSelectedAddressId(def.id);
    setCheckoutOpen(true);
  };

  const confirmCheckout = async () => {
    if (!selectedAddressId) {
      toast({ title: "Select a delivery address", variant: "destructive" });
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data } = await apiClient.post<RazorpayOrderResponse>("/orders", { addressId: selectedAddressId });
      setCheckoutOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        toast({ title: "Payment gateway unavailable. Please try again.", variant: "destructive" });
        setCheckoutLoading(false);
        return;
      }
      const rzp = new Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "BLANC PARFUM",
        description: "Luxury Extrait de Parfum",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handler: async (response: any) => {
          setVerifyingPayment(true);
          try {
            await apiClient.post(`/orders/${data.orderId}/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            dispatch(clearCart());
            toast({ title: "Order placed!", description: "Thank you for your purchase." });
            navigate("/profile");
          } catch {
            setVerifyingPayment(false);
            toast({ title: "Payment verification failed. Contact support.", variant: "destructive" });
          }
        },
        modal: { ondismiss: () => setCheckoutLoading(false) },
        prefill: { name: user?.name ?? "", email: user?.email ?? "", contact: user?.phone ?? "" },
        config: {
          display: {
            blocks: { upi_block: { name: "Pay using UPI", instruments: [{ method: "upi", flows: ["collect", "qrcode"] }] } },
            sequence: ["block.upi_block"],
            preferences: { show_default_blocks: true },
          },
        },
        theme: { color: "#B8860B" },
      });
      rzp.open();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Checkout failed. Please try again.";
      toast({ title: msg, variant: "destructive" });
      setCheckoutLoading(false);
    }
  };

  if (verifyingPayment) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <div className="w-10 h-10 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mb-6" />
          <h2 className="font-display text-2xl mb-2">Confirming Your Order</h2>
          <p className="text-muted-foreground font-body text-sm">Please wait while we verify your payment...</p>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag size={24} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-3xl mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Discover our fragrances and find your signature scent.</p>
          <Button asChild className="rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium px-8 h-11">
            <Link to="/shop">Shop Now</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Shopping Cart" canonical="/cart" noindex />
      <div className="container mx-auto px-6 md:px-12 lg:px-20 pt-24 pb-16 max-w-5xl">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-body font-medium uppercase tracking-[0.15em] mb-10"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" /> Continue Shopping
        </Link>

        <h1 className="font-display text-4xl font-light mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0 divide-y divide-border">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-5 py-6 first:pt-0"
              >
                <Link to={`/product/${item.productId}`} className="w-24 h-28 bg-secondary overflow-hidden rounded-lg flex-shrink-0 hover:opacity-80 transition-opacity">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.productId}`} className="hover:text-accent transition-colors">
                        <h3 className="font-display text-lg">{item.name}</h3>
                      </Link>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-[0.15em] font-body">{item.size}ml</p>
                    </div>
                    <button
                      onClick={() => dispatch(removeItemFromCart({ productId: item.productId, size: item.size }))}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1"
                    >
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                      <button
                        onClick={() => dispatch(updateItemQuantity({ productId: item.productId, size: item.size, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-body w-7 text-center">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateItemQuantity({ productId: item.productId, size: item.size, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-body font-medium">{"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-secondary/50 rounded-2xl p-8">
              <h3 className="font-display text-xl mb-6">Order Summary</h3>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{"\u20B9"}{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-accent font-medium">Free</span>
                </div>
                <div className="border-t border-border pt-4 mt-4 flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>{"\u20B9"}{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Button
                onClick={openCheckout}
                className="w-full mt-6 h-12 rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium"
              >
                Proceed to Checkout
              </Button>
              {!isAuthenticated && (
                <p className="text-[11px] text-muted-foreground text-center mt-3 font-body">
                  You'll be asked to sign in
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address dialog */}
      <Dialog open={checkoutOpen} onOpenChange={(o) => { setCheckoutOpen(o); if (!o) setCheckoutLoading(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">Delivery Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {addresses.length === 0 || showAddrForm ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Label <span className="text-destructive">*</span></Label>
                    <Input placeholder="Home, Office..." value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} className="rounded-lg" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Street <span className="text-destructive">*</span></Label>
                    <Input placeholder="123 Main St, Apt 4" value={addrForm.street} onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">City <span className="text-destructive">*</span></Label>
                    <Input value={addrForm.city} onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">State <span className="text-destructive">*</span></Label>
                    <Input value={addrForm.state} onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">PIN Code <span className="text-destructive">*</span></Label>
                    <Input value={addrForm.zip} onChange={(e) => setAddrForm((f) => ({ ...f, zip: e.target.value }))} className="rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] uppercase tracking-[0.15em] font-body font-medium">Country <span className="text-destructive">*</span></Label>
                    <Input value={addrForm.country} onChange={(e) => setAddrForm((f) => ({ ...f, country: e.target.value }))} className="rounded-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <Switch checked={addrForm.isDefault} onCheckedChange={(v) => setAddrForm((f) => ({ ...f, isDefault: v }))} />
                  <Label className="text-[11px] uppercase tracking-[0.15em] cursor-pointer font-body font-medium">Set as default</Label>
                </div>
                <div className="flex gap-2 pt-2">
                  {showAddrForm && addresses.length > 0 && (
                    <Button variant="outline" onClick={() => setShowAddrForm(false)} className="flex-1 rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium">
                      Cancel
                    </Button>
                  )}
                  <Button
                    disabled={addrSaving || !addrForm.label || !addrForm.street || !addrForm.city || !addrForm.state || !addrForm.zip}
                    onClick={async () => {
                      setAddrSaving(true);
                      try {
                        const saved = await dispatch(addAddress(addrForm)).unwrap();
                        setSelectedAddressId(saved.id);
                        setShowAddrForm(false);
                        setAddrForm(emptyAddr);
                        toast({ title: "Address saved" });
                      } catch {
                        toast({ title: "Failed to save address", variant: "destructive" });
                      } finally {
                        setAddrSaving(false);
                      }
                    }}
                    className="flex-1 rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium"
                  >
                    {addrSaving ? "Saving\u2026" : "Save & Continue"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                      selectedAddressId === addr.id
                        ? "border-foreground bg-secondary/50"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-body font-medium flex items-center gap-2">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-[0.1em] bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-medium">Default</span>
                          )}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-body mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} – {addr.zip}
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
                        selectedAddressId === addr.id ? "border-foreground bg-foreground" : "border-border"
                      }`} />
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => { setShowAddrForm(true); setAddrForm(emptyAddr); }}
                  className="w-full text-[11px] text-muted-foreground hover:text-foreground font-body font-medium uppercase tracking-[0.15em] py-2 transition-colors"
                >
                  + Add new address
                </button>

                <div className="pt-3 space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground font-body border-t border-border pt-4">
                    <span>Total</span>
                    <span className="text-foreground font-medium">{"\u20B9"}{total.toLocaleString("en-IN")}</span>
                  </div>
                  <Button
                    onClick={confirmCheckout}
                    disabled={!selectedAddressId || checkoutLoading}
                    className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] h-12 font-body font-medium gap-2"
                  >
                    {checkoutLoading ? "Opening payment\u2026" : (
                      <><span>Pay {"\u20B9"}{total.toLocaleString("en-IN")}</span><ChevronRight size={14} /></>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cart;
