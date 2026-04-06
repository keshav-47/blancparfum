import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "@/assets/blanc-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white/70">
      {/* Main footer */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <img src={logo} alt="BLANC" className="h-14 w-auto mb-5 brightness-0 invert" />
            <p className="text-sm font-body leading-relaxed text-white/40 max-w-sm">
              Handcrafted Extrait de Parfum made with the world's rarest ingredients.
              Each bottle is a testament to craftsmanship and passion.
            </p>
          </div>

          {/* Shop */}
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-white/30 mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Fragrances", to: "/shop" },
                { label: "Women", to: "/shop?category=women" },
                { label: "Men", to: "/shop?category=men" },
                { label: "Unisex", to: "/shop?category=unisex" },
                { label: "New Arrivals", to: "/shop?category=new" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm font-body text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-white/30 mb-5">Company</h4>
            <ul className="space-y-3">
              {[
                { label: "About", to: "/about" },
                { label: "Bespoke", to: "/custom" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="text-sm font-body text-white/50 hover:text-white transition-colors duration-300"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2">
            <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-white/30 mb-5">Stay Updated</h4>
            <p className="text-sm font-body text-white/40 mb-4">New scents, stories & exclusive offers.</p>
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 text-[11px] font-body font-medium uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors"
            >
              Sign Up <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 md:px-12 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30 font-body">
            &copy; {new Date().getFullYear()} BLANC PARFUM. All rights reserved.
          </p>
          <div className="flex gap-8">
            {["Privacy", "Terms"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-body"
              >
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
