import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-display text-2xl tracking-[0.3em] mb-4">BLANC</h3>
            <p className="text-sm font-body text-primary-foreground/60 leading-relaxed">
              The art of scent, distilled to its purest form.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-body uppercase tracking-[0.2em] mb-4">Shop</h4>
            <ul className="space-y-2">
              {["All Fragrances", "Women", "Men", "Unisex", "New Arrivals"].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-body uppercase tracking-[0.2em] mb-4">Company</h4>
            <ul className="space-y-2">
              {["About BLANC", "Custom Perfumes", "Stores", "Careers"].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-body uppercase tracking-[0.2em] mb-4">Stay Connected</h4>
            <p className="text-sm text-primary-foreground/50 mb-4">
              Be the first to know about new fragrances and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent border border-primary-foreground/20 px-3 py-2 text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:border-accent"
              />
              <button className="bg-accent text-accent-foreground px-4 py-2 text-xs uppercase tracking-wider font-body font-semibold hover:bg-accent/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} BLANC. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="#" className="text-xs text-primary-foreground/40 hover:text-primary-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
