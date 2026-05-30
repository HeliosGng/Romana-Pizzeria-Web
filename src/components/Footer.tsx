import React from "react";
import { ShieldCheck } from "lucide-react";
import { Language } from "../types";
import { translations } from "../languages";

interface FooterProps {
  currentLanguage: Language;
}

export default function Footer({ currentLanguage }: FooterProps) {
  const t = (key: string) => translations[currentLanguage]?.[key] || key;
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="bg-brand-dark border-t border-brand-dark py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Brand Display footer */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="font-sans font-black tracking-tighter text-2xl text-white uppercase sm:text-3xl">
            ROMANA <span className="text-brand-red">PIZZA</span>
          </span>
          <p className="text-[10px] font-mono uppercase tracking-widest text-brand-beige/60 max-w-md mx-auto leading-relaxed">
            ★ {t("footer.tagline")} ★
          </p>
        </div>

        {/* Links row */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono uppercase tracking-widest">
          <a href="#hero-section" className="text-brand-beige hover:text-brand-red transition-colors font-bold">Home</a>
          <a href="#menu" className="text-brand-beige hover:text-brand-red transition-colors font-bold">Menu</a>
          <a href="#about" className="text-brand-beige hover:text-brand-red transition-colors font-bold">Contact</a>
          <span className="text-white/10 hidden sm:inline">|</span>
          <a href="?admin=true" className="text-brand-beige/40 hover:text-brand-red transition-colors flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-red" /> {t("Admin Portal") || "Owner Portal"}
          </a>
        </div>

        <div className="h-[1px] w-20 bg-brand-beige/20 mx-auto" />

        {/* Copy text */}
        <div className="space-y-2 text-[10px] sm:text-xs font-mono text-brand-beige/50">
          <p className="uppercase tracking-wider">
            &copy; {currentYear} Romana Pizza Tirana. {t("footer.rights")}
          </p>
        </div>

      </div>
    </footer>
  );
}
