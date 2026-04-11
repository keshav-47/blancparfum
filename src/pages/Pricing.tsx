import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import ScrollReveal from "@/components/animations/ScrollReveal";
import TextReveal from "@/components/animations/TextReveal";

const sizes = [
  {
    ml: "10ml",
    label: "Discovery",
    price: "₹1,299",
    description: "Perfect for trying a new scent",
    features: ["Travel-friendly size", "2–3 weeks of daily wear", "Ideal for gifting"],
  },
  {
    ml: "30ml",
    label: "Signature",
    price: "₹2,499",
    description: "Our most popular size",
    features: ["2–3 months of daily wear", "Best value per ml", "Elegant bottle design"],
    popular: true,
  },
  {
    ml: "50ml",
    label: "Connoisseur",
    price: "₹3,999",
    description: "For the true fragrance lover",
    features: ["4–6 months of daily wear", "Statement bottle", "Luxury unboxing experience"],
  },
];

const Pricing = () => (
  <Layout>
    <SEO
      title="Pricing"
      description="BLANC PARFUM pricing — Handcrafted Extrait de Parfum starting from ₹1,299. Free shipping on all orders."
      canonical="/pricing"
    />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-20">
      <div className="text-center mb-16">
        <ScrollReveal>
          <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Pricing</p>
        </ScrollReveal>
        <TextReveal as="h1" className="font-display text-4xl md:text-5xl font-light mb-4">
          Simple, Transparent Pricing
        </TextReveal>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground font-body text-sm max-w-lg mx-auto"
        >
          Every BLANC fragrance is an Extrait de Parfum — the highest concentration of perfume oil.
          All prices include taxes. Free shipping on every order.
        </motion.p>
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {sizes.map((size, i) => (
          <ScrollReveal key={size.ml} delay={i * 0.12}>
            <div className={`relative rounded-2xl border p-8 h-full flex flex-col ${
              size.popular
                ? "border-accent bg-accent/5 shadow-lg"
                : "border-border"
            }`}>
              {size.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-body font-medium uppercase tracking-[0.2em] bg-accent text-white px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <p className="text-[11px] font-body font-medium uppercase tracking-[0.2em] text-muted-foreground">{size.ml}</p>
              <h3 className="font-display text-2xl mt-1 mb-2">{size.label}</h3>
              <p className="font-display text-3xl font-light mb-1">{size.price}</p>
              <p className="text-xs text-muted-foreground font-body mb-6">{size.description}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {size.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm font-body text-muted-foreground">
                    <Check size={14} className="text-accent mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/shop">
                <Button
                  variant={size.popular ? "default" : "outline"}
                  className="w-full rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium h-11 gap-2"
                >
                  Shop Now <ArrowRight size={13} />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Bespoke pricing */}
      <ScrollReveal>
        <div className="rounded-2xl border border-border p-8 md:p-12 text-center">
          <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Bespoke</p>
          <h2 className="font-display text-3xl font-light mb-3">Custom Fragrance</h2>
          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-2">
            Work with our master perfumers to create a scent that is uniquely yours.
          </p>
          <p className="font-display text-2xl font-light mb-6">Starting from ₹4,999</p>
          <p className="text-xs text-muted-foreground font-body mb-6">Consultation is free. Price varies based on ingredients and complexity.</p>
          <Link to="/custom">
            <Button variant="outline" className="rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium h-11 px-8 gap-2">
              Start Your Bespoke Journey <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </ScrollReveal>

      {/* Additional info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
        {[
          { title: "Free Shipping", desc: "On every order, nationwide" },
          { title: "Secure Payment", desc: "Razorpay-powered, UPI/Card/NetBanking" },
          { title: "Easy Returns", desc: "Sealed products within 7 days" },
        ].map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 0.1} className="text-center">
            <h4 className="font-display text-lg mb-1">{item.title}</h4>
            <p className="text-xs text-muted-foreground font-body">{item.desc}</p>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </Layout>
);

export default Pricing;
