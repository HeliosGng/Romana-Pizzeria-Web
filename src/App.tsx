import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Menu from "./components/Menu";
import AboutContact from "./components/AboutContact";
import AdminDashboard from "./components/AdminDashboard";
import Footer from "./components/Footer";
import ShoppingCart from "./components/ShoppingCart";
import { MenuItem, Language, CartItem } from "./types";

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [activeSection, setActiveSection] = useState<string>("home");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);

  useEffect(() => {
    const isOwnerRoute =
      window.location.pathname === "/admin" ||
      window.location.search.includes("admin=true") ||
      window.location.hash === "#admin";

    if (isOwnerRoute) {
      setIsAdminActive(true);
    } else {
      // It's the public retail site: register and query visitor statistics correlation
      fetch("/api/visit", { method: "POST" })
        .then((res) => res.json())
        .catch((err) => console.error("Traffic counter ping skipped/offline:", err));
    }
  }, []);

  // Shopping Cart States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const addToCart = (item: MenuItem, amt = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.menuItem.id === item.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += amt;
        return updated;
      }
      return [...prev, { menuItem: item, quantity: amt }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, newQty: number) => {
    setCart((prev) =>
      prev.map((c) => (c.menuItem.id === itemId ? { ...c, quantity: newQty } : c))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Fetch all menu items from Express server API on mount
  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/data/menu.json");
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        console.error("Failed to load menu database");
      }
    } catch (err) {
      console.error("Networking error reading menu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Soft scroll trigger that navigates the user dynamically
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    let targetId = "";
    if (sectionId === "home") targetId = "hero-section";
    else if (sectionId === "menu") targetId = "menu";
    else if (sectionId === "about") targetId = "about";

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isAdminRoute =
    isAdminActive ||
    window.location.pathname === "/admin" ||
    window.location.search.includes("admin=true") ||
    window.location.hash === "#admin";

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-stone-950 font-sans text-stone-200 selection:bg-amber-500 selection:text-stone-950 flex flex-col justify-between">
        {/* Simple clean Admin header */}
        <header className="bg-brand-beige text-brand-dark px-6 py-4 border-b-2 border-brand-dark flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-sans font-black tracking-tighter text-xl text-brand-dark uppercase">
              ROMANA<span className="text-brand-red">.</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-brand-dark/55 bg-brand-dark/5 border border-brand-dark/15 px-1.5 py-0.5 uppercase font-black">
              ADMIN WEBSITE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language panel inside Admin console */}
            <div className="flex border border-brand-dark rounded-none overflow-hidden text-[9px] font-bold uppercase bg-brand-beige">
              <button
                onClick={() => setCurrentLanguage("en")}
                className={`px-2 py-1 transition-colors cursor-pointer ${
                  currentLanguage === "en" ? "bg-brand-dark text-white" : "text-brand-dark hover:bg-brand-red/10"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setCurrentLanguage("sq")}
                className={`px-2 py-1 transition-colors cursor-pointer ${
                  currentLanguage === "sq" ? "bg-brand-dark text-white" : "text-brand-dark hover:bg-brand-red/10"
                }`}
              >
                SQ
              </button>
            </div>

            <button
              onClick={() => {
                setIsAdminActive(false);
                // Force a clean reload to "/" so React states reset
                window.location.href = "/";
              }}
              className="px-3 py-1.5 bg-white hover:bg-brand-beige text-brand-dark border border-brand-dark font-mono text-[9px] uppercase font-black transition-colors cursor-pointer"
            >
              ← Retail Store
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono text-[9px] uppercase font-extrabold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Connected Server
            </div>
          </div>
        </header>

        <main className="flex-grow bg-brand-beige">
          <AdminDashboard
            currentLanguage={currentLanguage}
            menuItems={menuItems}
            onItemsChange={fetchMenuItems}
          />
        </main>

        <footer className="bg-brand-dark text-brand-beige py-4 text-center border-t-2 border-brand-dark">
          <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            Romana Pizza Tirana • Administrative Console • Authorized Personnel Only
          </p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-200 selection:bg-amber-500 selection:text-stone-950 flex flex-col justify-between scroll-smooth">
      {/* Dynamic Header Navbar Section */}
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        activeSection={activeSection}
        setActiveSection={scrollToSection}
        isAdminUnlocked={false}
        cartCount={cart.reduce((acc, curr) => acc + curr.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <main className="flex-grow">
        {/* Hero Banner Section */}
        <Hero
          currentLanguage={currentLanguage}
          onExploreMenu={() => scrollToSection("menu")}
        />

        {/* Menu Listings Section */}
        <Menu
          currentLanguage={currentLanguage}
          menuItems={menuItems}
          isLoading={isLoading}
          onAddToCart={addToCart}
        />

        {/* Detailed contact, map grid and Google Reviews client feedback */}
        <AboutContact currentLanguage={currentLanguage} />
      </main>

      {/* Shopping Cart Drawer */}
      <ShoppingCart
        currentLanguage={currentLanguage}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />

      {/* Styled Footer Block */}
      <Footer currentLanguage={currentLanguage} />
    </div>
  );
}
