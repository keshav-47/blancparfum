import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Minus, Plus, X, ArrowLeft, ChevronRight, ShoppingBag, Store, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import AddressForm, { emptyAddress } from "@/components/AddressForm";
import { CartSkeleton } from "@/components/skeletons/PageSkeletons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeItemFromCart, updateItemQuantity, fetchServerCart } from "@/store/slices/cartSlice";
import { fetchUserProfile, addAddress } from "@/store/slices/userSlice";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/hooks/useCheckout";
import type { Address } from "@/types";

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { placeOrder } = useCheckout();

  const { items, loading } = useAppSelector((s) => s.cart);
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const { profile } = useAppSelector((s) => s.user);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal;
  const addresses = profile?.addresses ?? [];

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<"delivery" | "in_store">("delivery");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id">>(emptyAddress);
  const [inStoreName, setInStoreName] = useState("");
  const [inStorePhone, setInStorePhone] = useState("");
  const [inStoreEmail, setInStoreEmail] = useState("");
  const [inStoreErrors, setInStoreErrors] = useState({ name: "", phone: "", email: "" });

  function openCheckout(mode: "delivery" | "in_store" = isAuthenticated ? "delivery" : "in_store") {
    setCheckoutMode(mode);
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    if (def) setSelectedAddressId(def.id);
    setCheckoutOpen(true);
  }

  useEffect(() => {
    if (isAuthenticated) {
      if (!profile) dispatch(fetchUserProfile());
      dispatch(fetchServerCart());
    }
  }, [isAuthenticated, profile, dispatch]);

  useEffect(() => {
    if (checkoutOpen && checkoutMode === "in_store") {
      setInStoreName((value) => value || user?.name || "");
      setInStorePhone((value) => value || user?.phone?.replace("+91", "") || "");
      setInStoreEmail((value) => value || user?.email || "");
    }
  }, [checkoutOpen, checkoutMode, user]);

  useEffect(() => {
    if (searchParams.get("checkout") === "in-store" && items.length > 0) {
      openCheckout("in_store");
      navigate("/cart", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, items.length, navigate]);

  const confirmCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login?returnTo=/cart");
      return;
    }
    if (!selectedAddressId) {
      toast({ title: "Select a delivery address", variant: "destructive" });
      return;
    }
    setCheckoutLoading(true);
    await placeOrder({ mode: "delivery", addressId: selectedAddressId }, {
      onOpen: () => setCheckoutOpen(false),
      onDismiss: () => { setCheckoutLoading(false); setCheckoutOpen(true); },
      onVerifying: () => setVerifyingPayment(true),
      onSuccess: () => {
        toast({ title: "Order placed!", description: "Thank you for your purchase." });
        navigate("/profile");
      },
      onError: (msg) => {
        setVerifyingPayment(false);
        setCheckoutLoading(false);
        toast({ title: msg, variant: "destructive" });
      },
    });
  };

  const confirmInStoreCheckout = async () => {
    const name = inStoreName.trim();
    const phone = inStorePhone.replace(/\D/g, "").slice(0, 10);
    const email = inStoreEmail.trim();
    const errors = { name: "", phone: "", email: "" };
    if (name.length < 2) errors.name = "Enter the customer name";
    if (phone.length !== 10) errors.phone = "Enter a 10-digit phone number";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
    setInStoreErrors(errors);
    if (errors.name || errors.phone || errors.email) return;

    setCheckoutLoading(true);
    await placeOrder({
      mode: "in_store",
      customerName: name,
      customerPhone: phone,
      customerEmail: email || undefined,
      items,
    }, {
      onOpen: () => setCheckoutOpen(false),
      onDismiss: () => { setCheckoutLoading(false); setCheckoutOpen(true); },
      onVerifying: () => setVerifyingPayment(true),
      onSuccess: () => {
        setVerifyingPayment(false);
        setCheckoutLoading(false);
        toast({ title: "Order placed!", description: "In-store purchase confirmed." });
      },
      onError: (msg) => {
        setVerifyingPayment(false);
        setCheckoutLoading(false);
        toast({ title: msg, variant: "destructive" });
      },
    });
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

  if (loading && items.length === 0) {
    return (
      <Layout>
        <CartSkeleton />
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag size={24} className="text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-3xl mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground font-body text-sm mb-8 max-w-xs">Discover our fragrances and find your signature scent.</p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-24 pb-16 overflow-hidden">
        <Link
          to="/shop"
          className="group inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-[11px] font-body font-medium uppercase tracking-[0.15em] mb-10"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" /> Continue Shopping
        </Link>

        <h1 className="font-display text-4xl font-semibold mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-0 divide-y divide-border">
            {items.map((item, i) => (
              <motion.div
                key={`${item.productId}-${item.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3 sm:gap-5 py-6 first:pt-0"
              >
                <Link to={`/product/${item.productId}`} className="w-20 sm:w-24 h-24 sm:h-28 bg-secondary overflow-hidden rounded-lg flex-shrink-0 hover:opacity-80 transition-opacity">
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
                onClick={() => openCheckout()}
                className="w-full mt-6 h-12 rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium"
              >
                Proceed to Checkout
              </Button>
              {!isAuthenticated && (
                <p className="text-[11px] text-muted-foreground text-center mt-3 font-body">
                  Choose in-store checkout or sign in for delivery
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={(o) => { setCheckoutOpen(o); if (!o) setCheckoutLoading(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2 rounded-full bg-secondary/60 p-1">
              <button
                type="button"
                onClick={() => setCheckoutMode("delivery")}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[11px] font-body font-medium uppercase tracking-[0.13em] transition-colors ${
                  checkoutMode === "delivery" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Truck size={13} /> Delivery
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMode("in_store")}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-[11px] font-body font-medium uppercase tracking-[0.13em] transition-colors ${
                  checkoutMode === "in_store" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Store size={13} /> In-store
              </button>
            </div>

            {checkoutMode === "delivery" ? (
              !isAuthenticated ? (
                <div className="space-y-4 rounded-xl border border-border p-4">
                  <div>
                    <p className="font-body text-sm font-medium">Sign in for delivery checkout</p>
                    <p className="mt-1 text-sm text-muted-foreground font-body">Delivery orders need a saved shipping address.</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      onClick={() => navigate("/login?returnTo=/cart")}
                      className="rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium"
                    >
                      Sign in
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutMode("in_store")}
                      className="rounded-full uppercase tracking-[0.15em] text-[11px] h-11 font-body font-medium"
                    >
                      Use in-store
                    </Button>
                  </div>
                </div>
              ) : addresses.length === 0 || showAddrForm ? (
                <AddressForm
                  value={addrForm}
                  onChange={setAddrForm}
                  saving={addrSaving}
                  submitLabel="Save & Continue"
                  onCancel={showAddrForm && addresses.length > 0 ? () => setShowAddrForm(false) : undefined}
                  onSubmit={async () => {
                    setAddrSaving(true);
                    try {
                      const saved = await dispatch(addAddress(addrForm)).unwrap();
                      setSelectedAddressId(saved.id);
                      setShowAddrForm(false);
                      setAddrForm(emptyAddress);
                      toast({ title: "Address saved" });
                    } catch {
                      toast({ title: "Failed to save address", variant: "destructive" });
                    } finally {
                      setAddrSaving(false);
                    }
                  }}
                />
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
                            {addr.street}, {addr.city}, {addr.state} - {addr.zip}
                          </p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors ${
                          selectedAddressId === addr.id ? "border-foreground bg-foreground" : "border-border"
                        }`} />
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowAddrForm(true); setAddrForm(emptyAddress); }}
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
              )
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-body text-sm font-medium">Customer details</p>
                  <p className="mt-1 text-sm text-muted-foreground font-body">For purchases completed in person. No delivery address required.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground">Name</label>
                    <Input
                      value={inStoreName}
                      onChange={(e) => { setInStoreName(e.target.value); setInStoreErrors((prev) => ({ ...prev, name: "" })); }}
                      placeholder="Customer name"
                      className={`font-body placeholder:text-muted-foreground/45 ${inStoreErrors.name ? "border-destructive" : ""}`}
                    />
                    {inStoreErrors.name && <p className="text-[11px] text-destructive font-body">{inStoreErrors.name}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground">Phone</label>
                    <div className="flex gap-2">
                      <span className="flex h-10 items-center rounded-md border border-border bg-secondary/60 px-3 text-sm text-muted-foreground font-body">+91</span>
                      <Input
                        type="tel"
                        value={inStorePhone}
                        onChange={(e) => {
                          setInStorePhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                          setInStoreErrors((prev) => ({ ...prev, phone: "" }));
                        }}
                        placeholder="Enter 10-digit number"
                        className={`min-w-0 flex-1 font-body placeholder:text-muted-foreground/40 ${inStoreErrors.phone ? "border-destructive" : ""}`}
                      />
                    </div>
                    {inStoreErrors.phone && <p className="text-[11px] text-destructive font-body">{inStoreErrors.phone}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-body font-medium uppercase tracking-[0.15em] text-muted-foreground">Email optional</label>
                    <Input
                      type="email"
                      value={inStoreEmail}
                      onChange={(e) => { setInStoreEmail(e.target.value); setInStoreErrors((prev) => ({ ...prev, email: "" })); }}
                      placeholder="For receipt updates"
                      className={`font-body placeholder:text-muted-foreground/40 ${inStoreErrors.email ? "border-destructive" : ""}`}
                    />
                    {inStoreErrors.email && <p className="text-[11px] text-destructive font-body">{inStoreErrors.email}</p>}
                  </div>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground font-body">
                    <span>Total</span>
                    <span className="text-foreground font-medium">{"\u20B9"}{total.toLocaleString("en-IN")}</span>
                  </div>
                  <Button
                    onClick={confirmInStoreCheckout}
                    disabled={checkoutLoading}
                    className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] h-12 font-body font-medium gap-2"
                  >
                    {checkoutLoading ? "Opening payment\u2026" : (
                      <><span>Pay in-store {"\u20B9"}{total.toLocaleString("en-IN")}</span><ChevronRight size={14} /></>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Cart;
