import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";

const Privacy = () => (
  <Layout>
    <SEO title="Privacy Policy" canonical="/privacy" />
    <div className="container mx-auto px-6 md:px-12 lg:px-20 pt-28 pb-20 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Legal</p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-10">Privacy Policy</h1>

        <div className="space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          <p>Last updated: April 2026</p>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">1. Information We Collect</h2>
            <p>When you use BLANC PARFUM, we may collect the following information:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">Account information:</strong> Name, email address, phone number provided during sign-up.</li>
              <li><strong className="text-foreground">Order information:</strong> Shipping address, order history, and payment details (processed securely via Razorpay — we do not store card numbers).</li>
              <li><strong className="text-foreground">Usage data:</strong> Pages visited, products viewed, and interactions with the site collected via Vercel Analytics.</li>
              <li><strong className="text-foreground">Custom fragrance requests:</strong> Scent preferences, occasions, and messages you submit.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfill your orders.</li>
              <li>To send order confirmations and status updates via email.</li>
              <li>To create and deliver bespoke fragrance requests.</li>
              <li>To improve our products, website, and customer experience.</li>
              <li>To communicate promotional offers (only with your consent).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">3. Third-Party Services</h2>
            <p>We use the following third-party services to operate:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-foreground">Razorpay</strong> — Payment processing. Subject to <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Razorpay's Privacy Policy</a>.</li>
              <li><strong className="text-foreground">Firebase</strong> — Phone authentication.</li>
              <li><strong className="text-foreground">Google Sign-In</strong> — OAuth authentication.</li>
              <li><strong className="text-foreground">Brevo</strong> — Transactional emails.</li>
              <li><strong className="text-foreground">Vercel Analytics</strong> — Anonymous usage analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including HTTPS encryption, JWT-based authentication, and secure payment processing. We do not store payment card details on our servers.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for marketing communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">6. Cookies</h2>
            <p>We use essential cookies and local storage to maintain your session, cart contents, and authentication state. We do not use third-party tracking cookies.</p>
          </section>

          <section>
            <h2 className="font-display text-xl text-foreground mb-3">7. Contact Us</h2>
            <p>For any privacy-related questions or requests, contact us at <a href="mailto:customercare@blancparfum.in" className="text-accent hover:underline">customercare@blancparfum.in</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  </Layout>
);

export default Privacy;
