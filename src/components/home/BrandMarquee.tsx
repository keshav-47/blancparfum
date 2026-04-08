const phrases = [
  "Handcrafted in India",
  "Extrait de Parfum",
  "Rare Ingredients",
  "Small Batch",
  "Free Shipping",
  "Bespoke Fragrances",
  "Luxury Niche Perfumery",
  "Since 2024",
];

const BrandMarquee = () => (
  <section className="border-y border-border/50 py-4 overflow-hidden bg-secondary/30">
    <div className="flex animate-marquee whitespace-nowrap">
      {[...phrases, ...phrases].map((p, i) => (
        <span
          key={i}
          className="text-[10px] font-body font-medium uppercase tracking-[0.2em] sm:tracking-[0.3em] text-muted-foreground mx-4 sm:mx-8 inline-flex items-center gap-2 sm:gap-3"
        >
          <span className="w-1 h-1 rounded-full bg-accent" />
          {p}
        </span>
      ))}
    </div>
  </section>
);

export default BrandMarquee;
