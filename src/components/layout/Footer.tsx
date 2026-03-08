import { Link } from "react-router-dom";
import logo from "@/assets/blanc-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logo} alt="BLANC" className="h-16 w-auto mb-4 mix-blend-screen" />
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              Handmade parfum. Extrait de parfum.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-body uppercase tracking-[0.2em] text-primary mb-4">Shop</h4>
            <ul className="space-y-2">
              {["All Fragrances", "Women", "Men", "Unisex", "New Arrivals"].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-body uppercase tracking-[0.2em] text-primary mb-4">Company</h4>
            <ul className="space-y-2">
              {["About BLANC", "Custom Perfumes", "Stores", "Careers"].map((item) => (
                <li key={item}>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-body uppercase tracking-[0.2em] text-primary mb-4">Stay Connected</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Be the first to know about new fragrances and exclusive offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-wider font-body font-semibold hover:bg-primary/90 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BLANC. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">
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
