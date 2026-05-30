import React, { useState } from "react";
import { Flame, Heart, Info, RefreshCw, Sparkles, Image } from "lucide-react";
import { MenuItem, Language } from "../types";
import { translations } from "../languages";
import { motion, AnimatePresence } from "motion/react";

interface MenuProps {
  currentLanguage: Language;
  menuItems: MenuItem[];
  isLoading: boolean;
  onAddToCart: (item: MenuItem) => void;
}

export default function Menu({ currentLanguage, menuItems, isLoading, onAddToCart }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showEuro, setShowEuro] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  
  const t = (key: string) => translations[currentLanguage]?.[key] || key;

  // Approximate Albania Lek (ALL) to EUR exchange rate: 100 Lek = 1 EUR
  const ALL_TO_EUR_RATE = 0.01;

  const categories = [
    { id: "all", label: t("cat.all") },
    { id: "pizza", label: t("cat.pizza") },
    { id: "sandwich", label: t("cat.sandwich") },
    { id: "salad", label: t("cat.salad") },
    { id: "pasta", label: t("cat.pasta") },
    { id: "calzone", label: t("cat.calzone") },
    { id: "traditional", label: t("cat.traditional") },
    { id: "drink", label: t("cat.drink") },
    { id: "dessert", label: t("cat.dessert") },
    { id: "appetizer", label: t("cat.appetizer") },
  ];

  // Filter items matching active category
  const filteredItems = menuItems.filter((item) => {
    if (activeCategory === "all") return true;
    return item.category === activeCategory;
  });

  // Grouping logic for pizzas
  interface SizeOption {
    size: string;
    price: number;
    id: string;
    item: MenuItem;
  }

  interface GroupedMenuItem {
    isGrouped: boolean;
    baseId: string;
    category: string;
    nameEn: string;
    nameSq: string;
    descriptionEn: string;
    descriptionSq: string;
    image: string;
    isAvailable: boolean;
    isVegetarian?: boolean;
    isSpicy?: boolean;
    sizes: SizeOption[];
    price: number;
  }

  const grouped: Record<string, GroupedMenuItem> = {};
  const displayList: GroupedMenuItem[] = [];
  const addedKeys = new Set<string>();

  filteredItems.forEach((item) => {
    if (item.category === "pizza") {
      const match = item.id.match(/^(.*)-(30|40)$/);
      if (match) {
        const baseId = match[1];
        const sizeStr = match[2] + " cm";

        // Strip " (30 cm)" or " (40 cm)" from names
        const cleanNameEn = item.nameEn.replace(/\s*\(\s*(30|40)\s*cm\s*\)/i, "").trim();
        const cleanNameSq = item.nameSq.replace(/\s*\(\s*(30|40)\s*cm\s*\)/i, "").trim();

        if (!grouped[baseId]) {
          grouped[baseId] = {
            isGrouped: true,
            baseId,
            category: item.category,
            nameEn: cleanNameEn,
            nameSq: cleanNameSq,
            descriptionEn: item.descriptionEn,
            descriptionSq: item.descriptionSq,
            image: item.image,
            isAvailable: false,
            isVegetarian: item.isVegetarian,
            isSpicy: item.isSpicy,
            sizes: [],
            price: item.price
          };
        }

        grouped[baseId].sizes.push({
          size: sizeStr,
          price: item.price,
          id: item.id,
          item: item
        });

        if (item.isAvailable) {
          grouped[baseId].isAvailable = true;
        }
      } else {
        // Individual pizza item
        grouped[item.id] = {
          isGrouped: false,
          baseId: item.id,
          category: item.category,
          nameEn: item.nameEn,
          nameSq: item.nameSq,
          descriptionEn: item.descriptionEn,
          descriptionSq: item.descriptionSq,
          image: item.image,
          isAvailable: item.isAvailable,
          isVegetarian: item.isVegetarian,
          isSpicy: item.isSpicy,
          sizes: [],
          price: item.price
        };
      }
    } else {
      // Non-pizza item
      grouped[item.id] = {
        isGrouped: false,
        baseId: item.id,
        category: item.category,
        nameEn: item.nameEn,
        nameSq: item.nameSq,
        descriptionEn: item.descriptionEn,
        descriptionSq: item.descriptionSq,
        image: item.image,
        isAvailable: item.isAvailable,
        isVegetarian: item.isVegetarian,
        isSpicy: item.isSpicy,
        sizes: [],
        price: item.price
      };
    }
  });

  filteredItems.forEach((item) => {
    let key = item.id;
    if (item.category === "pizza") {
      const match = item.id.match(/^(.*)-(30|40)$/);
      if (match) {
        key = match[1];
      }
    }

    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      const groupedItem = grouped[key];
      if (groupedItem) {
        // Enforce ascending size sorting
        groupedItem.sizes.sort((a, b) => parseInt(a.size) - parseInt(b.size));
        displayList.push(groupedItem);
      }
    }
  });

  // Calculate price with toggleable currency conversion
  const formatPrice = (priceLek: number) => {
    if (showEuro) {
      const priceEur = (priceLek * ALL_TO_EUR_RATE).toFixed(2);
      return `€${priceEur}`;
    }
    return `${priceLek} ${t("menu.allLek")}`;
  };

  return (
    <section id="menu" className="py-20 bg-white text-brand-dark border-b border-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Display */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-6 mb-12 pb-8 border-b-2 border-brand-dark text-left">
          <div className="space-y-2">
            <span className="text-brand-red font-mono text-xs uppercase tracking-widest font-black flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("menu.subtitle")}</span>
            </span>
            <h2 id="menu-title" className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tighter uppercase font-sans">
              {t("menu.title")}
            </h2>
          </div>

          {/* Interactive Euro Converter Bar Styled Brutalist */}
          <div id="currency-converter-bar" className="flex flex-col sm:flex-row sm:items-center gap-3 justify-end">
            <button
              onClick={() => setShowEuro(!showEuro)}
              className={`px-4 py-3 rounded-none border-2 border-brand-dark flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
                showEuro 
                  ? "bg-brand-red text-white shadow-none translate-x-0.5 translate-y-0.5" 
                  : "bg-white text-brand-dark hover:bg-brand-beige shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-current ${showEuro ? "animate-spin" : ""}`} />
              <span>{t("menu.priceConvert")} ({showEuro ? "ALL Lek" : "Euro €"})</span>
            </button>
            <span className="text-brand-dark/50 text-[10px] font-mono uppercase font-black text-right">
              {t("menu.priceInEuro")} 1 € ≈ 100 Lek
            </span>
          </div>
        </div>

        {/* Categories Tabs Filter list represented with block tags */}
        <div id="categories-filter-row" className="flex flex-wrap items-center justify-start gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-none font-black text-xs uppercase tracking-widest transition-all text-center border-2 border-brand-dark cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-brand-dark text-brand-beige shadow-none"
                  : "bg-white text-brand-dark hover:bg-brand-beige shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div id="menu-loading-spinner" className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-none animate-spin" />
            <p className="text-brand-dark/50 font-mono text-xs uppercase tracking-widest font-black">Syncing Romana database...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty State */
          <div id="menu-empty-state" className="text-center py-20 bg-brand-beige border-2 border-brand-dark rounded-none p-6 max-w-2xl mx-auto shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12 text-brand-red mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-brand-dark font-black text-xl uppercase tracking-tight mb-2">No items listed</h3>
            <p className="text-brand-dark/70 text-sm">
              {t("menu.noItems")}
            </p>
          </div>
        ) : (
          /* Grid list with motion animations and block cards, cut into sections by category */
          <div className="space-y-16 text-left">
            {categories.filter(cat => cat.id !== "all").map((cat) => {
              const catItems = displayList.filter(item => item.category === cat.id);
              if (catItems.length === 0) return null;

              return (
                <div key={cat.id} id={`category-section-${cat.id}`} className="space-y-8 text-left">
                  {/* Category Title & Badge Section Divider */}
                  <div className="flex items-center justify-between gap-4 border-b-4 border-brand-dark pb-3">
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-dark font-sans flex items-center gap-3">
                      <span className="w-2.5 h-6 bg-brand-red inline-block"></span>
                      {cat.label}
                    </h3>
                    <span className="font-mono text-xs font-black bg-brand-dark text-brand-beige px-3 py-1 uppercase tracking-widest border-2 border-brand-dark shadow-[2.5px_2.5px_0px_0px_rgba(217,65,38,1)]">
                      {catItems.length} {catItems.length === 1 ? t("menu.badgeItem") : t("menu.badgeItems")}
                    </span>
                  </div>

                  {/* Grid of items in this category */}
                  <motion.div 
                    id={`menu-items-grid-${cat.id}`} 
                    layout 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {catItems.map((item) => {
                        const isPizzaGroup = item.isGrouped && item.sizes.length > 0;
                        const currentSize = isPizzaGroup ? (selectedSizes[item.baseId] || item.sizes[0].size) : "";
                        const selectedSizeOpt = isPizzaGroup ? item.sizes.find(s => s.size === currentSize) || item.sizes[0] : null;

                        const displayedPrice = selectedSizeOpt ? selectedSizeOpt.price : item.price;
                        const displayedImage = selectedSizeOpt ? selectedSizeOpt.item.image : item.image;
                        const isCurrentlyAvailable = selectedSizeOpt ? selectedSizeOpt.item.isAvailable : item.isAvailable;
                        const activeItem = selectedSizeOpt ? selectedSizeOpt.item : (menuItems.find(m => m.id === item.baseId) || item);

                        return (
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            key={item.baseId}
                            id={`menu-card-${item.baseId}`}
                            className={`bg-white rounded-none border-2 border-brand-dark overflow-hidden flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-150 relative ${
                              !isCurrentlyAvailable ? "opacity-60 select-none pb-2 bg-brand-beige" : ""
                            }`}
                          >
                            {/* Card Header Image */}
                            <div className="relative aspect-[16/10] overflow-hidden bg-brand-beige border-b-2 border-brand-dark select-none flex items-center justify-center">
                              {displayedImage ? (
                                <>
                                  <img
                                    src={displayedImage}
                                    alt={currentLanguage === "en" ? item.nameEn : item.nameSq}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover select-none"
                                  />
                                  {/* Dark overlay for rich contrast */}
                                  <div className="absolute inset-0 bg-brand-dark/10" />
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-brand-dark/50 p-4 font-mono text-[10px] tracking-widest font-black uppercase text-center bg-brand-beige w-full h-full">
                                  <Image className="w-8 h-8 mb-2 text-brand-dark/40 stroke-[1.5]" />
                                  <span>{currentLanguage === "en" ? "Photo soon" : "Foto së shpejti"}</span>
                                </div>
                              )}
                              
                              {/* Out of Stock Ribbon */}
                              {!isCurrentlyAvailable && (
                                <div className="absolute inset-0 bg-white/90 flex items-center justify-center p-3">
                                  <span className="bg-brand-red text-white font-mono text-xs font-black tracking-widest px-4 py-2 border-2 border-brand-dark uppercase">
                                    {t("menu.outOfStock")}
                                  </span>
                                </div>
                              )}

                              {/* Vegetarian/Spicy stickers */}
                              {isCurrentlyAvailable && (
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                  {item.isVegetarian && (
                                    <span className="bg-emerald-600 text-white font-mono font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border border-brand-dark shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1">
                                      <Heart className="w-2.5 h-2.5 fill-white" />
                                      <span>{t("menu.vegetarian")}</span>
                                    </span>
                                  )}
                                  {item.isSpicy && (
                                    <span className="bg-brand-red text-white font-mono font-black text-[9px] uppercase tracking-widest px-2.5 py-1 border border-brand-dark shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] flex items-center gap-1">
                                      <Flame className="w-2.5 h-2.5 fill-white" />
                                      <span>{t("menu.spicy")}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Category Stamp Overlay */}
                              {isCurrentlyAvailable && (
                                <span className="absolute bottom-3 right-3 bg-white text-brand-dark font-mono text-[9px] uppercase tracking-widest font-black px-2.5 py-1 border border-brand-dark">
                                  {item.category}
                                </span>
                              )}
                            </div>

                            {/* Card Body & Information */}
                            <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="font-black text-brand-dark text-lg uppercase tracking-tight font-sans leading-none">
                                    {currentLanguage === "en" ? item.nameEn : item.nameSq}
                                  </h3>
                                  <span className="text-brand-red text-lg font-black font-mono shrink-0 whitespace-nowrap select-all bg-brand-red/5 px-2 py-0.5 border border-brand-red/10">
                                    {formatPrice(displayedPrice)}
                                  </span>
                                </div>
                                
                                <p className="text-brand-dark/70 text-xs leading-relaxed font-sans font-medium line-clamp-3">
                                  {currentLanguage === "en" ? item.descriptionEn : item.descriptionSq}
                                </p>

                                {/* Size option selector buttons for Pizza Type selection */}
                                {isPizzaGroup && (
                                  <div className="pt-2 flex items-center gap-3">
                                    <span className="text-[10px] font-mono font-black uppercase text-brand-dark/50 tracking-wider">
                                      {currentLanguage === "en" ? "Select Size:" : "Zgjidh Madhësinë:"}
                                    </span>
                                    <div className="flex gap-1.5">
                                      {item.sizes.map((sizeOpt) => {
                                        const isSelected = sizeOpt.size === currentSize;
                                        return (
                                          <button
                                            key={sizeOpt.size}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedSizes(prev => ({
                                                ...prev,
                                                [item.baseId]: sizeOpt.size
                                              }));
                                            }}
                                            className={`px-3 py-1 font-mono text-xs font-black uppercase border-2 tracking-wider transition-all duration-100 cursor-pointer ${
                                              isSelected
                                                ? "bg-brand-red text-white border-brand-dark shadow-[1px_1px_0px_0px_rgba(26,26,26,1)] translate-x-0.5 translate-y-0.5"
                                                : "bg-white text-brand-dark border-brand-dark hover:bg-brand-beige"
                                            }`}
                                          >
                                            {sizeOpt.size}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card Footer Call to Order & Delivery buttons */}
                              <div className="pt-4 border-t-2 border-brand-dark/10 flex flex-col gap-3">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-black uppercase tracking-wider text-brand-dark/45 flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-brand-red shrink-0" />
                                    <span>TAKEOUT & DELIVERY</span>
                                  </span>
                                </div>

                                {isCurrentlyAvailable && (
                                  <div className="grid grid-cols-2 gap-2 select-none">
                                    <a
                                      href="tel:+355696885195"
                                      className="bg-white hover:bg-brand-beige text-brand-dark font-black py-2 border-2 border-brand-dark text-center text-[10px] tracking-widest uppercase cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <span>📞 Call Us</span>
                                    </a>
                                    <button
                                      onClick={() => {
                                        onAddToCart(activeItem as MenuItem);
                                      }}
                                      className="bg-brand-red hover:bg-brand-red-hover text-white font-black py-2 border-2 border-brand-dark text-center text-[10px] tracking-widest uppercase cursor-pointer flex items-center justify-center gap-1 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                                    >
                                      <span>{currentLanguage === "en" ? "🚀 Add to Cart" : "🚀 Në Shportë"}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Footer Order Reminder Banner (Styled retro-sticker style) */}
        <div id="menu-order-alert-banner" className="mt-16 bg-brand-beige border-2 border-brand-dark p-6 sm:p-8 rounded-none text-center space-y-2 shadow-[6px_6px_0px_0px_rgba(217,65,38,0.2)] max-w-4xl mx-auto">
          <p className="text-brand-dark font-black text-base uppercase tracking-tight font-sans">
            🔥 {t("menu.callToOrder")}
          </p>
          <p className="text-brand-dark/60 text-[10px] sm:text-xs font-mono uppercase tracking-widest leading-relaxed font-bold">
            FAST SECURE PICKUP AT RRUGA ËNGJËLL MARASHI • CALL +355 69 688 5195
          </p>
        </div>

      </div>
    </section>
  );
}
