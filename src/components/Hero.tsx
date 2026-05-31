import React, { useEffect, useState } from "react";
import { Star, Clock, MapPin, ChevronRight } from "lucide-react";
import { Language } from "../types";
import { translations } from "../languages";

interface HeroProps {
  currentLanguage: Language;
  onExploreMenu: () => void;
}

export default function Hero({ currentLanguage, onExploreMenu }: HeroProps) {
  const [isOpen, setIsOpen] = useState(true);
  const t = (key: string) => translations[currentLanguage]?.[key] || key;

  // Simple real-time check for open status based on Tirana's timezone
  useEffect(() => {
    const checkOpenStatus = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const tiranaTime = new Date(utc + (3600000 * 2));
      const hours = tiranaTime.getHours();
      const day = tiranaTime.getDay(); // 0 is Sunday, 1 is Monday, etc.
      
      if (day !== 0 && hours >= 11 && hours < 23) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkOpenStatus();
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const heroImageSrc = "/romana_pizza_hero_1780135272225.png";

  return (
    <section id="hero-section" className="relative bg-brand-beige text-brand-dark pt-10 pb-16 lg:pb-24 overflow-hidden border-b border-brand-dark">
      {/* Decorative vertical/horizontal line grid matching Swiss grid style */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-brand-dark/5 pointer-events-none hidden lg:block" />
      <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-brand-dark/5 pointer-events-none hidden lg:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Text Content Block with Bold Typography */}
          <div className="lg:col-span-6 space-y-8 text-left">
            
            {/* Status indicators in a pill block */}
            <div className="flex flex-wrap items-center gap-3">
              <span 
                id="live-status-tag"
                className={`px-3.5 py-1 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-brand-dark bg-white ${
                  isOpen 
                    ? "text-emerald-700" 
                    : "text-rose-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                {isOpen ? t("hero.statusOpen") : t("hero.statusClosed")}
              </span>

              <div id="hero-rating" className="flex items-center gap-1 bg-brand-dark text-white border border-brand-dark px-3 py-1">
                <Star className="w-3.5 h-3.5 fill-brand-red text-brand-red" />
                <span className="text-white text-xs font-black leading-none">4.6</span>
                <span className="text-white/70 text-[10px] font-mono uppercase tracking-wide"> (40 Google reviews)</span>
              </div>
            </div>

            {/* Display Title - HUGE, uppercase, bold tracking-tighter */}
            <div className="space-y-4">
              <span className="text-brand-red text-xs sm:text-sm font-black font-mono tracking-widest uppercase block">
                ★ PIZZERIA ORIGINALE TIRANË
              </span>
              <h1 id="hero-display-title" className="font-sans font-black text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-brand-dark tracking-tighter leading-[0.9] uppercase">
                {t("hero.title")}
              </h1>
            </div>

            {/* Subtitle / Description */}
            <p id="hero-display-desc" className="text-brand-dark/80 text-base sm:text-lg leading-relaxed max-w-xl font-medium font-sans">
              {t("hero.subtitle")}
            </p>

            {/* Neo-brutalist Quick Stats Grid */}
            <div id="quick-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border-2 border-brand-dark p-4 rounded-none flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <MapPin className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-brand-dark/50 text-[10px] font-mono uppercase font-black tracking-widest">ADDRESS</h4>
                  <p className="text-brand-dark text-sm font-black uppercase">Rruga Ëngjëll Marashi</p>
                  <p className="text-brand-dark/70 text-xs font-bold uppercase">Tirana 1052, Albania</p>
                </div>
              </div>
              
              <div className="bg-white border-2 border-brand-dark p-4 rounded-none flex items-start gap-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                <Clock className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-brand-dark/50 text-[10px] font-mono uppercase font-black tracking-widest">SCHEDULE</h4>
                  <p className="text-brand-dark text-sm font-black uppercase">MON - SAT: 11:00 AM - 11:00 PM</p>
                  <p className="text-brand-dark/70 text-xs font-bold uppercase">SUNDAY CLOSED • HAPUR E HËNË - E SHTUNË</p>
                </div>
              </div>
            </div>

            {/* CTA Buttons in brutalist high contrast styling */}
            <div id="hero-cta-buttons" className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                id="explore-menu-btn"
                onClick={onExploreMenu}
                className="w-full sm:w-auto bg-brand-dark hover:bg-brand-red text-white hover:text-white font-black px-8 py-4 rounded-none flex items-center justify-center gap-2 border-2 border-brand-dark transition-all cursor-pointer text-sm uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(217,65,38,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <span>{t("hero.viewMenu")}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Picture Asset Block styled like a rigid offset card frame */}
          <div id="hero-image-block" className="lg:col-span-6 relative flex justify-center mt-6 lg:mt-0">
            <div className="relative w-full max-w-lg bg-brand-dark border-2 border-brand-dark rounded-none overflow-hidden aspect-[4/3] shadow-[8px_8px_0px_0px_rgba(217,65,38,1)] group">
              <img
                src={heroImageSrc}
                alt={t("hero.title")}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter grayscale-10 hover:grayscale-0 transition-all duration-500"
              />
              {/* Retro absolute labels for artisanal tone */}
              <div className="absolute top-4 left-4 bg-brand-dark text-white text-[9px] font-mono tracking-widest uppercase font-black px-2 py-1">
                ORIGINAL RECIPE
              </div>
              
              {/* Bottom solid bar overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-brand-dark/90 backdrop-blur-xs p-4 border-t border-white/20 text-left">
                <p className="text-[10px] font-mono text-brand-red font-black uppercase tracking-widest">★ WOOD-FIRED CLASSIC</p>
                <h3 className="text-white font-black text-xl tracking-tight uppercase">ROMANA SPECIAL PIZZA</h3>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
