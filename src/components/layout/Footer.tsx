import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logo from "@/assets/blanc-logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white/70">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-20 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src={logo} alt="BLANC" className="h-14 w-auto mb-5 brightness-0 invert" />
            <p className="text-sm font-body leading-relaxed text-white/40 max-w-sm">
              Handcrafted Extrait de Parfum made with the world's rarest ingredients.
            </p>
            <div className="mt-5">
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

          {/* Shop */}
          <div>
            <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-white/30 mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Fragrances", to: "/shop" },
                { label: "Women", to: "/shop?category=women" },
                { label: "Men", to: "/shop?category=men" },
                { label: "Unisex", to: "/shop?category=unisex" },
                { label: "Pricing", to: "/pricing" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm font-body text-white/50 hover:text-white transition-colors duration-300">
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
                { label: "About Us", to: "/about" },
                { label: "Contact Us", to: "/contact" },
                { label: "Bespoke", to: "/custom" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm font-body text-white/50 hover:text-white transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-body font-medium uppercase tracking-[0.25em] text-white/30 mb-5">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms & Conditions", to: "/terms" },
                { label: "Refund Policy", to: "/refund-policy" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm font-body text-white/50 hover:text-white transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-white/30 font-body">
            &copy; {new Date().getFullYear()} BLANC PARFUM. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { label: "Privacy", to: "/privacy" },
              { label: "Terms", to: "/terms" },
              { label: "Refunds", to: "/refund-policy" },
              { label: "Contact", to: "/contact" },
            ].map((item) => (
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
