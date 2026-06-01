import { useAppSelector } from "@/store/hooks";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import ScrollReveal from "@/components/animations/ScrollReveal";

const StatsBand = () => {
  const count = useAppSelector((s) => s.products.items.length);

  const stats = [
    { value: count, suffix: "+", label: "Signature Fragrances" },
    { value: 100, suffix: "%", label: "Handcrafted in India" },
    { value: 20, suffix: "%+", label: "Extrait Concentration" },
  ];

  return (
    <section className="border-y border-border/50 bg-secondary/20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 grid grid-cols-3 gap-4 md:gap-12 text-center">
        {stats.map((s, i) => (
          <ScrollReveal key={s.label} delay={i * 0.12}>
            <AnimatedCounter
              target={s.value}
              suffix={s.suffix}
              className="font-display text-4xl md:text-6xl font-light text-foreground"
            />
            <p className="mt-2 md:mt-3 text-[10px] md:text-[11px] font-body font-medium uppercase tracking-[0.18em] md:tracking-[0.2em] text-muted-foreground">
              {s.label}
            </p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default StatsBand;
