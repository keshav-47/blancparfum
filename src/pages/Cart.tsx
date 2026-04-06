import { Link } from "react-router-dom";
import { Minus, Plus, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeFromCart, updateQuantity } from "@/store/slices/cartSlice";

const Cart = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + shipping;

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
                    <p className="font-body">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-secondary p-8">
            <h3 className="font-display text-xl mb-6">Order Summary</h3>
            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-accent">Free shipping on orders over ₹200</p>
              )}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>${total}</span>
              </div>
            </div>
            <Button className="w-full mt-6 h-12 rounded-none uppercase tracking-[0.15em] text-xs">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
