import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, X, ArrowLeft, MapPin, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeFromCart, updateQuantity, clearCart } from "@/store/slices/cartSlice";
import { fetchUserProfile } from "@/store/slices/userSlice";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";

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
  const shipping = subtotal >= 2000 ? 0 : 150;
  const total = subtotal + shipping;

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Load Razorpay SDK once
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch profile (for addresses) when authenticated
  useEffect(() => {
    if (isAuthenticated && !profile) dispatch(fetchUserProfile());
  }, [isAuthenticated, profile, dispatch]);

  const addresses = profile?.addresses ?? [];

  const openCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
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
      // Step 1 – sync frontend cart to server
      await apiClient.post("/cart/sync", {
        items: items.map((i) => ({
          productId: i.productId,
          sizeMl: i.size,
          quantity: i.quantity,
        })),
      });

      // Step 2 – create order & get Razorpay order
      const { data } = await apiClient.post<RazorpayOrderResponse>("/orders", {
        addressId: selectedAddressId,
      });

      setCheckoutOpen(false);

      // Step 2 – open Razorpay checkout
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
          // Step 3 – verify payment
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
            toast({ title: "Payment verification failed. Contact support.", variant: "destructive" });
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },
        theme: { color: "#0f0f0f" },
      });

      rzp.open();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Checkout failed. Please try again.";
      toast({ title: msg, variant: "destructive" });
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
          <h2 className="font-display text-3xl mb-4">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-8">Discover our fragrances and find your signature scent.</p>
          <Button asChild className="rounded-none uppercase tracking-[0.15em] text-xs">
            <Link to="/">Shop Now</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Shopping Cart" description="Review your BLANC PARFUM selections and proceed to checkout." canonical="/cart" />
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-8">
          <ArrowLeft size={16} /> Continue Shopping
        </Link>

        <h1 className="font-display text-4xl mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 pb-6 border-b border-border"
              >
                <div className="w-24 h-28 bg-secondary overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-display text-lg">{item.name}</h3>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.size}ml</p>
                    </div>
                    <button
                      onClick={() => dispatch(removeFromCart({ productId: item.productId, size: item.size }))}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, size: item.size, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: item.productId, size: item.size, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 border border-border flex items-center justify-center hover:border-foreground transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="font-body">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-secondary p-8 min-w-0 overflow-hidden">
            <h3 className="font-display text-xl mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">Free shipping on orders over ₹2,000</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Button
              onClick={openCheckout}
              className="w-full mt-6 h-12 rounded-none uppercase tracking-wider text-xs"
            >
              Proceed to Checkout
            </Button>
            {!isAuthenticated && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                You'll be asked to sign in
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address selection dialog */}
      <Dialog open={checkoutOpen} onOpenChange={(o) => { setCheckoutOpen(o); if (!o) setCheckoutLoading(false); }}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">Select Delivery Address</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {addresses.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <MapPin size={28} className="mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
                <Button asChild variant="outline" size="sm" className="text-xs uppercase tracking-wider rounded-none">
                  <Link to="/profile" onClick={() => setCheckoutOpen(false)}>
                    Add Address in Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`w-full text-left p-4 rounded border transition-colors ${
                      selectedAddressId === addr.id
                        ? "border-foreground bg-secondary"
                        : "border-border hover:border-foreground/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {addr.label}
                          {addr.isDefault && (
                            <span className="text-[9px] uppercase tracking-wider bg-foreground text-background px-1.5 py-0.5 rounded-sm">Default</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} – {addr.zip}
                        </p>
                        <p className="text-xs text-muted-foreground">{addr.country}</p>
                      </div>
                      {selectedAddressId === addr.id && (
                        <div className="w-4 h-4 rounded-full bg-foreground shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                ))}

                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground border-t border-border pt-3 font-body">
                    <span>Total to pay</span>
                    <span className="text-foreground font-semibold">₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <Button
                    onClick={confirmCheckout}
                    disabled={!selectedAddressId || checkoutLoading}
                    className="w-full rounded-none uppercase tracking-[0.15em] text-xs h-11 flex items-center gap-2"
                  >
                    {checkoutLoading ? "Opening payment…" : (
                      <><span>Pay ₹{total.toLocaleString("en-IN")}</span><ChevronRight size={14} /></>
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
