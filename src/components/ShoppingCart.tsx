import React from "react";
import { X, Plus, Minus, Trash2, ShoppingCart as CartIcon, Phone } from "lucide-react";
import { CartItem, Language } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ShoppingCartProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export default function ShoppingCart({
  currentLanguage,
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: ShoppingCartProps) {
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPriceALL = cart.reduce((acc, curr) => acc + curr.menuItem.price * curr.quantity, 0);
  
  // Approximate conversion rate: 100 Lek = 1 EUR
  const totalPriceEUR = (totalPriceALL * 0.01).toFixed(2);

  // Local translations dictionary
  const dict = {
    en: {
      title: "Your Shopping Cart",
      emptyState: "Your cart is empty. Add delicious pizzas or drinks to get started!",
      total: "Grand Total:",
      removeBtn: "Remove",
      unitPrice: "Unit price",
      callInstructions: "To place your order, call us directly! We will prepare and deliver your items instantly.",
      callBtn: "Call Romana Pizza Now",
      subTitle: "What you are buying:",
      clearCart: "Clear Cart",
    },
    sq: {
      title: "Shporta Juaj",
      emptyState: "Shporta është bosh. Shto pica apo pije të shijshme për të filluar!",
      total: "Totali i Përgjithshëm:",
      removeBtn: "Hiq",
      unitPrice: "Çmimi për njësi",
      callInstructions: "Për të kryer porosinë, na telefononi direkt! Ne do t'ju përgatisim dhe dërgojmë produktet menjëherë.",
      callBtn: "Telefono Romana Pizza Tani",
      subTitle: "Në shportën tuaj:",
      clearCart: "Pastro Shportën",
    }
  };

  const t = (key: keyof typeof dict["en"]) => dict[currentLanguage][key] || dict["en"][key];
  const formattedItemsForCall = cart
    .map(item => `${item.quantity}x ${currentLanguage === "en" ? item.menuItem.nameEn : item.menuItem.nameSq}`)
    .join(", ");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-dark/80 backdrop-blur-xs z-50 transition-opacity"
          />

          {/* Lateral Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l-2 border-brand-dark shadow-[4px_0px_24px_rgba(0,0,0,0.15)] z-50 flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-5 border-b-2 border-brand-dark flex items-center justify-between bg-brand-beige">
              <div className="flex items-center gap-2">
                <CartIcon className="w-5 h-5 text-brand-red" />
                <h2 className="font-sans font-black text-lg uppercase tracking-tight text-brand-dark">
                  {t("title")}{" "}
                  <span className="text-xs bg-brand-red text-white py-0.5 px-2 ml-1 font-mono">
                    {totalItems}
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 px-2 border-2 border-brand-dark hover:bg-brand-red hover:text-white transition-colors cursor-pointer text-brand-dark font-black text-xs uppercase"
              >
                <X className="w-4 h-4 inline" />
              </button>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-12 h-12 rounded-none bg-brand-beige border-2 border-brand-dark/25 flex items-center justify-center text-brand-dark/40 mx-auto">
                    <CartIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-brand-dark/60 font-mono uppercase tracking-wide font-black max-w-xs mx-auto">
                    {t("emptyState")}
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-white border-2 border-brand-dark text-brand-dark text-[10px] font-black uppercase tracking-widest py-2 px-4 hover:bg-brand-beige"
                  >
                    Go Back To Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-brand-dark/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-black text-brand-dark/40">
                      {t("subTitle")}
                    </span>
                    <button
                      onClick={onClearCart}
                      className="text-[10px] text-brand-red hover:underline uppercase font-mono font-black"
                    >
                      [{t("clearCart")}]
                    </button>
                  </div>
                  <div className="space-y-4 divide-y divide-brand-dark/15">
                    {cart.map((item) => (
                      <div
                        key={item.menuItem.id}
                        className="pt-4 first:pt-0 flex items-start gap-4 text-left"
                      >
                        {/* Pizza thumbnail */}
                        <img
                          className="w-16 h-16 object-cover border-2 border-brand-dark bg-brand-dark shrink-0"
                          src={item.menuItem.image}
                          alt={item.menuItem.nameEn}
                          referrerPolicy="no-referrer"
                        />

                        {/* Info & Adjusters */}
                        <div className="flex-grow space-y-1">
                          <div className="flex items-start justify-between min-w-0">
                            <h4 className="font-sans font-black text-xs uppercase tracking-tight text-brand-dark truncate">
                              {currentLanguage === "en" ? item.menuItem.nameEn : item.menuItem.nameSq}
                            </h4>
                            <span className="text-xs font-black font-mono text-brand-red shrink-0 ml-2">
                              {item.menuItem.price * item.quantity} ALL
                            </span>
                          </div>

                          <p className="text-[10px] text-brand-dark/40 font-mono uppercase tracking-wide font-black">
                            {t("unitPrice")}: {item.menuItem.price} ALL
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            {/* Quantity adjusters */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))
                                }
                                className="w-6 h-6 border border-brand-dark text-brand-dark hover:bg-brand-beige font-black flex items-center justify-center text-xs"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="w-6 text-center font-mono font-black text-xs text-brand-dark">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                                className="w-6 h-6 border border-brand-dark text-brand-dark hover:bg-brand-beige font-black flex items-center justify-center text-xs"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Trash button */}
                            <button
                              onClick={() => onRemoveItem(item.menuItem.id)}
                              className="text-brand-dark/40 hover:text-brand-red p-1 text-[10px] font-mono font-black uppercase flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{t("removeBtn")}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Footer Total & Call-to-Order actions */}
            {cart.length > 0 && (
              <div className="border-t-2 border-brand-dark p-5 bg-brand-beige space-y-4">
                {/* Price Summary */}
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-xs font-black uppercase text-brand-dark">
                    <span>{t("total")}</span>
                    <span className="text-base text-brand-red font-black">
                      {totalPriceALL.toLocaleString()} ALL
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-brand-dark/50 font-bold uppercase">
                    <span>Euro (€) Equivalent:</span>
                    <span>€{totalPriceEUR}</span>
                  </div>
                </div>

                {/* Call instructions and direct button */}
                <div className="border-t border-brand-dark/10 pt-3 text-left space-y-3.5">
                  <p className="text-[10px] text-brand-dark/75 font-mono uppercase tracking-wide font-black leading-relaxed">
                    {t("callInstructions")}
                  </p>

                  <div className="bg-white border-2 border-dashed border-brand-dark/30 p-2.5 text-center font-mono">
                    <span className="block text-[8px] font-black uppercase text-brand-dark/50 tracking-wider mb-1">
                      Give these items to the staff:
                    </span>
                    <span className="text-[10px] font-bold uppercase text-brand-dark break-words">
                      {formattedItemsForCall}
                    </span>
                  </div>

                  <a
                    href="tel:+355696885195"
                    className="w-full bg-brand-red hover:bg-brand-red-hover text-white py-3 border-2 border-brand-dark uppercase font-black tracking-widest text-xs cursor-pointer shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-white animate-pulse" />
                    <span>{t("callBtn")}</span>
                  </a>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
