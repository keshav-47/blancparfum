import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Droplets, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import logo from "@/assets/blanc-logo.png";

const values = [
  {
    icon: Droplets,
    title: "Handcrafted Excellence",
    description:
      "Every BLANC fragrance is meticulously handcrafted in small batches, ensuring unparalleled quality and attention to detail in every bottle.",
  },
  {
    icon: Sparkles,
    title: "Rare Ingredients",
    description:
      "We source the world's rarest and finest ingredients — from Oud of Assam to Bulgarian Rose — to create fragrances that are truly extraordinary.",
  },
  {
    icon: Heart,
    title: "Made for You",
    description:
      "Our bespoke custom fragrance service lets you collaborate with our master perfumers to create a scent that is uniquely yours.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

const About = () => (
  <Layout>
    <SEO
      title="About"
      description="BLANC PARFUM — An exquisite Indian perfume house crafting custom-made Extrait de Parfum with the world's rarest ingredients."
      canonical="/about"
    />

    {/* Hero */}
    <section className="relative min-h-[60vh] flex items-center justify-center text-center px-4 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl space-y-6"
      >
        <img src={logo} alt="BLANC" className="h-20 mx-auto" />
        <h1 className="font-display text-4xl md:text-5xl tracking-wider">Our Story</h1>
        <p className="text-muted-foreground font-body leading-relaxed text-base md:text-lg">
          BLANC PARFUM is an exquisite Indian perfume house dedicated to the art of
          fine fragrance. We craft custom-made Extrait de Parfum using the world's
          rarest ingredients — each bottle a testament to craftsmanship, passion,
          and the belief that scent is the most intimate form of self-expression.
        </p>
      </motion.div>
    </section>

    {/* Brand narrative */}
    <section className="bg-card border-y border-border">
      <div className="container mx-auto px-4 lg:px-8 py-20 max-w-3xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6 font-body text-muted-foreground leading-relaxed text-[15px]"
        >
          <p>
            Born from a deep reverence for the age-old tradition of Indian perfumery,
            BLANC PARFUM bridges the gap between heritage and modern luxury. Our
            master perfumers draw inspiration from the rich aromatic legacy of the
            subcontinent — the smoky warmth of aged Oud, the delicate sweetness of
            Jasmine Sambac, the earthy depth of Vetiver from the plains of Lucknow.
          </p>
          <p>
            Every fragrance we create is an Extrait de Parfum — the highest
            concentration of perfume oil — ensuring a scent that is rich, long-lasting,
            and unmistakably luxurious. We never mass-produce; each batch is handcrafted
            in limited quantities, allowing us to maintain the uncompromising quality
            that defines BLANC.
          </p>
          <p>
            Beyond our curated collection, we offer a bespoke fragrance experience.
            Share your story, your memories, your vision — and our perfumers will
            translate it into a scent that is entirely, beautifully yours.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Values */}
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <h2 className="font-display text-2xl md:text-3xl tracking-wider text-center mb-14">
        What Sets Us Apart
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            className="text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-secondary flex items-center justify-center">
              <v.icon size={20} className="text-foreground" />
            </div>
            <h3 className="font-display text-lg tracking-wider">{v.title}</h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {v.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-card border-y border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16 text-center space-y-6">
        <h2 className="font-display text-2xl tracking-wider">Create Your Signature Scent</h2>
        <p className="text-sm text-muted-foreground font-body max-w-md mx-auto">
          Work with our perfumers to craft a fragrance that tells your story.
        </p>
        <Link to="/custom">
          <Button className="rounded-none uppercase tracking-[0.15em] text-xs h-11 px-8">
            Start Your Custom Fragrance
          </Button>
        </Link>
      </div>
    </section>

    {/* Map / Visit Us */}
    <section className="container mx-auto px-4 lg:px-8 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 justify-center mb-10">
          <MapPin size={18} className="text-muted-foreground" />
          <h2 className="font-display text-2xl tracking-wider">Visit Us</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-4 font-body md:col-span-1">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Address</p>
              <p className="text-sm leading-relaxed">
                BLANC PARFUM<br />
                Meerut, Uttar Pradesh<br />
                India
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Hours</p>
              <p className="text-sm leading-relaxed">
                Mon – Sat: 11:00 AM – 8:00 PM<br />
                Sunday: 12:00 PM – 6:00 PM
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Contact</p>
              <p className="text-sm">hello@blancparfum.in</p>
            </div>
          </div>
          <div className="md:col-span-2 border border-border overflow-hidden">
            <iframe
              title="BLANC PARFUM Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d436.3623987728469!2d77.63831436459043!3d28.960714398867335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c66bd9cd8cde5%3A0x44475d545c467fb5!2sThe%20Bansuri%20Cafe!5e0!3m2!1sen!2sin!4v1775510235658!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
