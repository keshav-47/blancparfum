import { Link } from "react-router-dom";
import logo from "@/assets/blanc-logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logo} alt="BLANC" className="h-20 w-auto mb-4" />
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              BLANC PARFUM — Handmade Extrait de Parfum.
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
              {[
                { label: "About BLANC", to: "/about" },
                { label: "Custom Perfumes", to: "/custom" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} BLANC PARFUM. All rights reserved.
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
