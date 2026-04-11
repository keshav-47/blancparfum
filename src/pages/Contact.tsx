import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Instagram } from "lucide-react";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import ScrollReveal from "@/components/animations/ScrollReveal";

const Contact = () => (
  <Layout>
    <SEO
      title="Contact Us"
      description="Get in touch with BLANC PARFUM. Customer support, order queries, and bespoke fragrance consultations."
      canonical="/contact"
    />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-20">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Get in Touch</p>
        <h1 className="font-display text-4xl md:text-5xl font-light mb-6">Contact Us</h1>
        <p className="text-muted-foreground font-body text-sm leading-relaxed max-w-xl mb-14">
          We'd love to hear from you. Whether you have a question about your order, need help with a bespoke fragrance, or just want to say hello — reach out.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact details */}
        <ScrollReveal direction="left">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg mb-1">Email</h3>
                <a href="mailto:customercare@blancparfum.in" className="text-sm font-body text-accent hover:underline">
                  customercare@blancparfum.in
                </a>
                <p className="text-xs text-muted-foreground font-body mt-1">We respond within 24–48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Phone size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg mb-1">Phone</h3>
                <a href="tel:+919520280824" className="text-sm font-body text-accent hover:underline">
                  +91 95202 80824
                </a>
                <p className="text-xs text-muted-foreground font-body mt-1">Mon–Sat, 11 AM – 8 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg mb-1">Address</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">
                  BLANC PARFUM<br />
                  The Bansuri Cafe<br />
                  Gate No. 8, Subharti University<br />
                  NH58, Meerut, Uttar Pradesh 250002
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg mb-1">Business Hours</h3>
                <p className="text-sm font-body text-muted-foreground">Mon – Sat: 11:00 AM – 8:00 PM</p>
                <p className="text-sm font-body text-muted-foreground">Sunday: 12:00 PM – 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Instagram size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg mb-1">Social</h3>
                <a href="https://www.instagram.com/blanc.parfume/" target="_blank" rel="noopener noreferrer" className="text-sm font-body text-accent hover:underline">
                  @blanc.parfume
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Map */}
        <ScrollReveal direction="right">
          <div className="rounded-2xl overflow-hidden h-full min-h-[400px]">
            <iframe
              title="BLANC PARFUM Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d436.3623987728469!2d77.63831436459043!3d28.960714398867335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c66bd9cd8cde5%3A0x44475d545c467fb5!2sThe%20Bansuri%20Cafe!5e0!3m2!1sen!2sin!4v1775510235658!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: 400 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </ScrollReveal>
      </div>
    </div>
  </Layout>
);

export default Contact;
