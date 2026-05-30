import React from "react";
import { Globe, Phone, ShieldCheck, ShoppingCart as CartIcon } from "lucide-react";
import { Language } from "../types";
import { translations } from "../languages";

interface NavbarProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
  isAdminUnlocked: boolean;
  cartCount: number;
  onOpenCart: () => void;
}

export default function Navbar({
  currentLanguage,
  onLanguageChange,
  activeSection,
  setActiveSection,
  isAdminUnlocked,
  cartCount,
  onOpenCart,
}: NavbarProps) {
  const t = (key: string) => translations[currentLanguage]?.[key] || key;

  const navItems = [
    { id: "home", label: t("nav.home") },
    { id: "menu", label: t("nav.menu") },
    { id: "about", label: t("nav.about") },
  ];

  return (
    <header id="nav-header" className="sticky top-0 z-50 bg-brand-beige text-brand-dark border-b border-brand-dark shadow-xs transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand matching Design HTML */}
          <div 
            id="logo-brand"
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveSection("home")}
          >
            <span className="font-sans font-black tracking-tighter text-2xl sm:text-3xl text-brand-dark uppercase">
              ROMANA<span className="text-brand-red">.</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono tracking-widest text-brand-dark/60 bg-brand-dark/5 border border-brand-dark/15 px-2 py-0.5 uppercase font-black">
              TIRANË
            </span>
          </div>

          {/* Desktop Navigation with Bold styling */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-4 lg:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all duration-150 cursor-pointer flex items-center gap-1.5 border-b-2 ${
                  activeSection === item.id
                    ? "text-brand-red border-brand-red"
                    : "text-brand-dark border-transparent hover:text-brand-red"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right hand controls (Language + Cart + Call to Order) */}
          <div id="nav-controls" className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selection Switcher matching the EN/AL pill style of the Design HTML */}
            <div id="language-pill-switcher" className="flex border border-brand-dark rounded-none overflow-hidden text-[10px] font-bold uppercase bg-brand-beige">
              <button
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-2 sm:px-3.5 sm:py-2.5 transition-colors cursor-pointer ${
                  currentLanguage === "en"
                    ? "bg-brand-dark text-white"
                    : "text-brand-dark hover:bg-brand-red/10"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange("sq")}
                className={`px-3 py-2 sm:px-3.5 sm:py-2.5 transition-colors cursor-pointer ${
                  currentLanguage === "sq"
                    ? "bg-brand-dark text-white"
                    : "text-brand-dark hover:bg-brand-red/10"
                }`}
              >
                SQ
              </button>
            </div>

            {/* Shopping Cart Button */}
            <button
              id="navbar-cart-trigger"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 bg-white hover:bg-brand-beige text-brand-dark font-black px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-none text-xs uppercase tracking-widest border border-brand-dark transition-all transform active:scale-95 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer selection:bg-transparent"
            >
              <CartIcon className="w-3.5 h-3.5 text-brand-red shrink-0" />
              <span className="hidden sm:inline">Shporta</span>
              <span className="bg-brand-red text-white py-0.5 px-1.5 text-[9px] font-mono leading-none font-black ml-0.5 sm:ml-1">
                {cartCount}
              </span>
            </button>

            {/* CTA order button - sharp and clean */}
            <a
              id="call-order-button"
              href="tel:+355696885195"
              className="flex items-center gap-1.5 bg-brand-red hover:bg-brand-red-hover text-white font-black px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-none text-xs uppercase tracking-widest border border-brand-dark transition-all transform active:scale-95 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("nav.orderNow")}</span>
            </a>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar matching minimal theme wrapper */}
        <div id="mobile-sub-nav" className="md:hidden flex items-center justify-around py-3 border-t border-brand-dark/10">
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`mob-nav-${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-1 ${
                activeSection === item.id
                  ? "text-brand-red font-black"
                  : "text-brand-dark/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
