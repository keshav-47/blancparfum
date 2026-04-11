import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const RefundPolicy = () => (
  <Layout>
    <SEO title="Cancellation & Refund Policy" canonical="/refund-policy" />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-10">Cancellation & Refund Policy</h1>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          <p>Last updated: April 2026</p>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">1. Order Cancellation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Orders can be cancelled within <strong className="text-foreground">24 hours</strong> of placing them, provided they have not been shipped.</li>
              <li>To cancel an order, contact us at <a href="mailto:customercare@blancparfum.in" className="text-accent hover:underline">customercare@blancparfum.in</a> with your order number.</li>
              <li>Once an order has been shipped, it cannot be cancelled.</li>
              <li>Custom/bespoke fragrance orders cannot be cancelled once production has begun.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">2. Returns</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Due to the nature of fragrances, we do <strong className="text-foreground">not accept returns</strong> on opened or used products.</li>
              <li>Sealed, unopened products may be returned within <strong className="text-foreground">7 days</strong> of delivery in their original packaging.</li>
              <li>Custom/bespoke fragrances are non-returnable.</li>
              <li>To initiate a return, email us at <a href="mailto:customercare@blancparfum.in" className="text-accent hover:underline">customercare@blancparfum.in</a> with your order number and reason for return.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">3. Damaged or Incorrect Products</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>If you receive a damaged, defective, or incorrect product, contact us within <strong className="text-foreground">48 hours</strong> of delivery.</li>
              <li>Please include photographs of the damaged product and packaging.</li>
              <li>We will arrange a <strong className="text-foreground">free replacement or full refund</strong> at our discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">4. Refund Process</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Approved refunds will be processed within <strong className="text-foreground">7–10 business days</strong>.</li>
              <li>Refunds will be credited to the <strong className="text-foreground">original payment method</strong> used during purchase.</li>
              <li>Shipping costs are non-refundable (BLANC PARFUM currently offers free shipping on all orders).</li>
              <li>For UPI/bank transfers, refunds may take an additional 2–3 business days to reflect in your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">5. Non-Refundable Items</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Opened or used fragrance products.</li>
              <li>Custom/bespoke fragrance orders once production has started.</li>
              <li>Products damaged due to customer mishandling after delivery.</li>
              <li>Gift cards or promotional credits.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">6. Exchange Policy</h2>
            <p>We currently do not offer direct exchanges. If you wish to exchange a product, please initiate a return (if eligible) and place a new order.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">7. Contact Us</h2>
            <p>For any cancellation, return, or refund queries:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Email: <a href="mailto:customercare@blancparfum.in" className="text-accent hover:underline">customercare@blancparfum.in</a></li>
              <li>Response time: Within 24–48 hours on business days</li>
            </ul>
          </section>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default RefundPolicy;
