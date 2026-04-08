import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const Terms = () => (
  <Layout>
    <SEO title="Terms & Conditions" canonical="/terms" />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-10">Terms & Conditions</h1>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          <p>Last updated: April 2026</p>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">1. General</h2>
            <p>By accessing and using blancparfum.in ("the Website"), you agree to be bound by these Terms & Conditions. BLANC PARFUM reserves the right to modify these terms at any time. Continued use of the Website constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">2. Products & Pricing</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All products are handcrafted Extrait de Parfum. Slight variations in colour or scent between batches are natural and not considered defects.</li>
              <li>Prices are listed in Indian Rupees (INR) and include applicable taxes.</li>
              <li>We reserve the right to update pricing without prior notice. Orders placed before a price change will be honoured at the original price.</li>
              <li>Product availability is subject to stock. If a product becomes unavailable after your order is placed, we will notify you and offer a full refund.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">3. Orders & Payment</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All orders require successful payment via Razorpay before processing begins.</li>
              <li>You will receive an order confirmation email upon successful payment.</li>
              <li>We reserve the right to cancel orders if we suspect fraudulent activity.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">4. Shipping & Delivery</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>We offer <strong className="text-foreground">free shipping</strong> on all orders across India.</li>
              <li>Orders are typically dispatched within 2–4 business days.</li>
              <li>Estimated delivery is 5–10 business days depending on your location.</li>
              <li>Delivery timelines are estimates and may vary due to factors beyond our control.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">5. Returns & Refunds</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Due to the nature of fragrances, we do not accept returns on opened products.</li>
              <li>If you receive a damaged or incorrect product, contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund.</li>
              <li>Refunds are processed within 7–10 business days to the original payment method.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">6. Custom Fragrance Requests</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Bespoke fragrance consultations are free and non-binding.</li>
              <li>Once a custom fragrance is agreed upon and payment is made, the order is final and non-refundable.</li>
              <li>Timelines for custom fragrances vary and will be communicated during the consultation.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">7. Intellectual Property</h2>
            <p>All content on this Website — including product names, descriptions, images, logos, and design — is the property of BLANC PARFUM and is protected by intellectual property laws. Unauthorized reproduction or distribution is prohibited.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">8. Limitation of Liability</h2>
            <p>BLANC PARFUM shall not be liable for any indirect, incidental, or consequential damages arising from the use of this Website or our products. Our maximum liability is limited to the amount paid for the specific order in question.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">9. Governing Law</h2>
            <p>These terms are governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Meerut, Uttar Pradesh.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">10. Contact</h2>
            <p>For questions regarding these terms, contact us at <a href="mailto:customercare@blancparfum.in" className="text-accent hover:underline">customercare@blancparfum.in</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default Terms;
