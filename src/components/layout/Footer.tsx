import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logo from "@/assets/blanc-logo.png";

const legalLinks = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-white/70">
      {/* Main footer */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Brand */}
          <div>
            <img src={logo} alt="BLANC" className="h-14 w-auto mb-5 brightness-0 invert" />
            <p className="text-sm font-body leading-relaxed text-white/40 max-w-sm">
              Handcrafted Extrait de Parfum made with the world's rarest ingredients.
              Each bottle is a testament to craftsmanship and passion.
            </p>
          </div>

          {/* Shop */}
          <div>
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
          <div>
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

            <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-white/30 mt-8 mb-4">Connect With Us</h4>
            <a
              href="https://www.instagram.com/blanc.parfume/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-body text-white/50 hover:text-white transition-colors duration-300"
            >
              <Instagram size={16} strokeWidth={1.5} /> Instagram
            </a>
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
            {legalLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors font-body"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
