import { Link } from "react-router-dom";
import { MapPin, Droplets, Sparkles, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/SEO";
import TextReveal from "@/components/animations/TextReveal";
import ImageReveal from "@/components/animations/ImageReveal";
import ScrollReveal from "@/components/animations/ScrollReveal";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import MagneticButton from "@/components/animations/MagneticButton";

const values = [
  {
    icon: Droplets,
    title: "Handcrafted Excellence",
    description: "Every BLANC fragrance is meticulously handcrafted in small batches, ensuring unparalleled quality and attention to detail in every bottle.",
  },
  {
    icon: Sparkles,
    title: "Rare Ingredients",
    description: "We source the world's rarest and finest ingredients — from Oud of Assam to Bulgarian Rose — to create fragrances that are truly extraordinary.",
  },
  {
    icon: Heart,
    title: "Made for You",
    description: "Our bespoke custom fragrance service lets you collaborate with our master perfumers to create a scent that is uniquely yours.",
  },
];

const stats = [
  { value: 50, suffix: "+", label: "Unique Fragrances" },
  { value: 47, suffix: "", label: "Rare Ingredients" },
  { value: 12, suffix: "", label: "Master Perfumers" },
  { value: 5000, suffix: "+", label: "Happy Customers" },
];

const About = () => (
  <Layout>
    <SEO
      title="About"
      description="BLANC PARFUM — An exquisite Indian perfume house crafting custom-made Extrait de Parfum with the world's rarest ingredients."
      canonical="/about"
    />

    {/* Hero */}
    <section className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=1920&q=80"
        alt="BLANC PARFUM"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-12 md:pb-16">
          <p className="text-[11px] font-body font-medium uppercase tracking-[0.3em] text-white/50 mb-3">
            Our Story
          </p>
          <TextReveal as="h1" className="font-display text-4xl md:text-5xl lg:text-6xl text-white max-w-lg" delay={0.2}>
            The Art of Fine Fragrance
          </TextReveal>
        </div>
      </div>
    </section>

    {/* Intro */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-20 md:py-28">
      <ScrollReveal>
        <p className="font-body text-muted-foreground leading-relaxed text-base md:text-lg max-w-3xl mx-auto text-center">
          BLANC PARFUM is an exquisite Indian perfume house dedicated to the art of
          fine fragrance. We craft custom-made Extrait de Parfum using the world's
          rarest ingredients — each bottle a testament to craftsmanship, passion,
          and the belief that scent is the most intimate form of self-expression.
        </p>
      </ScrollReveal>
    </section>

    {/* Stats */}
    <section className="border-y border-border/50 bg-secondary/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1} className="text-center">
              <AnimatedCounter
                target={stat.value}
                suffix={stat.suffix}
                className="font-display text-4xl md:text-5xl font-light tabular-nums"
              />
              <p className="mt-2 text-[10px] font-body font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {stat.label}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>

    {/* Brand narrative - split layout */}
    <section className="bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <ImageReveal
            src="https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80"
            alt="BLANC craftsmanship"
            className="aspect-[4/5] rounded-2xl"
            direction="left"
          />
          <div className="space-y-6">
            <ScrollReveal direction="right">
              <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent">Heritage</p>
            </ScrollReveal>
            <TextReveal as="h2" className="font-display text-3xl md:text-4xl font-light" delay={0.1}>
              Rooted in Tradition
            </TextReveal>
            <ScrollReveal delay={0.2} direction="right">
              <div className="space-y-5 font-body text-muted-foreground leading-relaxed text-sm">
                <p>
                  Born from a deep reverence for the age-old tradition of Indian perfumery,
                  BLANC PARFUM bridges the gap between heritage and modern luxury. Our
                  master perfumers draw inspiration from the rich aromatic legacy of the
                  subcontinent — the smoky warmth of aged Oud, the delicate sweetness of
                  Jasmine Sambac, the earthy depth of Vetiver.
                </p>
                <p>
                  Every fragrance we create is an Extrait de Parfum — the highest
                  concentration of perfume oil — ensuring a scent that is rich, long-lasting,
                  and unmistakably luxurious. We never mass-produce; each batch is handcrafted
                  in limited quantities.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-20 md:py-28">
      <div className="text-center mb-16">
        <ScrollReveal>
          <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Why BLANC</p>
        </ScrollReveal>
        <TextReveal as="h2" className="font-display text-3xl md:text-4xl font-light">
          What Sets Us Apart
        </TextReveal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
        {values.map((v, i) => (
          <ScrollReveal key={v.title} delay={i * 0.15} className="text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 flex items-center justify-center">
              <v.icon size={22} className="text-accent" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl tracking-wider">{v.title}</h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              {v.description}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-24 md:py-32 text-center">
        <ScrollReveal>
          <TextReveal as="h2" className="font-display text-3xl md:text-4xl text-white mb-4">
            Create Your Signature Scent
          </TextReveal>
          <p className="text-sm text-white/60 font-body mb-8 max-w-md mx-auto">
            Work with our perfumers to craft a fragrance that tells your story.
          </p>
          <Link to="/custom">
            <MagneticButton className="rounded-full uppercase tracking-[0.15em] text-[11px] font-body font-medium h-12 px-8 bg-white text-foreground hover:bg-white/90 inline-flex items-center gap-2">
              Start Your Bespoke Journey <ArrowRight size={14} />
            </MagneticButton>
          </Link>
        </ScrollReveal>
      </div>
    </section>

    {/* Map / Visit Us */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <ScrollReveal>
            <p className="text-[10px] font-body font-medium uppercase tracking-[0.3em] text-accent mb-3">Location</p>
          </ScrollReveal>
          <TextReveal as="h2" className="font-display text-3xl md:text-4xl font-light flex items-center justify-center gap-3">
            Visit Us
          </TextReveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          <ScrollReveal direction="left" className="space-y-6 font-body md:col-span-1">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">Address</p>
              <p className="text-sm leading-relaxed">
                BLANC PARFUM<br />
                The Bansuri Cafe<br />
                Gate No. 8, Subharti University<br />
                NH58, Meerut, Uttar Pradesh 250002
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">Hours</p>
              <p className="text-sm leading-relaxed">
                Mon – Sat: 11:00 AM – 8:00 PM<br />
                Sunday: 12:00 PM – 6:00 PM
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">Contact</p>
              <p className="text-sm">customercare@blancparfum.in</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" className="md:col-span-2 rounded-2xl overflow-hidden">
            <iframe
              title="BLANC PARFUM Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d436.3623987728469!2d77.63831436459043!3d28.960714398867335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c66bd9cd8cde5%3A0x44475d545c467fb5!2sThe%20Bansuri%20Cafe!5e0!3m2!1sen!2sin!4v1775510235658!5m2!1sen!2sin"
              width="100%"
              height="380"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </ScrollReveal>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
