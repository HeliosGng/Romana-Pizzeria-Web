import React, { useState, useEffect } from "react";
import { 
  Lock, ShieldAlert, Plus, Edit3, Trash2, CheckCircle2, 
  RefreshCw, Layers, Check, X, Sparkles, ArrowUp, ArrowDown, Eye
} from "lucide-react";
import { MenuItem, Language } from "../types";
import { translations } from "../languages";

interface AdminDashboardProps {
  currentLanguage: Language;
  menuItems: MenuItem[];
  onItemsChange: () => void; // Trigger a reload of items in parent App
}

export default function AdminDashboard({
  currentLanguage,
  menuItems,
  onItemsChange,
}: AdminDashboardProps) {
  const t = (key: string) => translations[currentLanguage]?.[key] || key;

  // Security, setup & session states
  const [earnings, setEarnings] = useState<number>(0);
  const [deliveries, setDeliveries] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [visits, setVisits] = useState<number>(0);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [isSorting, setIsSorting] = useState<boolean>(false);

  const [adminStatusLoading, setAdminStatusLoading] = useState<boolean>(true);
  const [hasAdmin, setHasAdmin] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [authState, setAuthState] = useState<"login" | "setup" | "verify">("login");

  // Authentication inputs
  const [authEmailInput, setAuthEmailInput] = useState<string>("");
  const [authPasswordInput, setAuthPasswordInput] = useState<string>("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>("");
  const [authCodeInput, setAuthCodeInput] = useState<string>("");
  const [devSnippet, setDevSnippet] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string>("");
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string>("");
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const token = localStorage.getItem("romana_admin_token");
      const res = await fetch("/api/orders/stats", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setEarnings(data.earnings ?? 0);
        setDeliveries(data.deliveries ?? 0);
        setRecentOrders(data.recentOrders ?? []);
        setVisits(data.visits ?? 0);
      } else if (res.status === 401 || res.status === 403) {
        handleLogOut();
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Move a menu item up in sequence
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const reordered = [...menuItems];
    const item = reordered[index];
    reordered[index] = reordered[index - 1];
    reordered[index - 1] = item;
    
    await saveNewOrder(reordered);
  };

  // Move a menu item down in sequence
  const handleMoveDown = async (index: number) => {
    if (index === menuItems.length - 1) return;
    const reordered = [...menuItems];
    const item = reordered[index];
    reordered[index] = reordered[index + 1];
    reordered[index + 1] = item;

    await saveNewOrder(reordered);
  };

  // Sync reordered items to the backend reorder API
  const saveNewOrder = async (reorderedList: MenuItem[]) => {
    setIsSorting(true);
    setSubmitSuccess("");
    setSubmitError("");
    try {
      const orderedIds = reorderedList.map(item => item.id);
      const token = localStorage.getItem("romana_admin_token");
      const res = await fetch("/api/menu/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ orderedIds })
      });
      if (res.ok) {
        setSubmitSuccess("Menu layout updated and saved successfully!");
        onItemsChange(); // Sync and reload items list inparent state
        setTimeout(() => setSubmitSuccess(""), 2500);
      } else {
        setSubmitError("Failed to update menu reordering on the server.");
      }
    } catch (err) {
      setSubmitError("Failed to reach the database server for sorting.");
    } finally {
      setIsSorting(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      setAdminStatusLoading(true);
      const token = localStorage.getItem("romana_admin_token");
      const res = await fetch("/api/admin/status", {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setHasAdmin(data.hasAdmin);
        setIsUnlocked(data.loggedIn);
        setVerified(data.verified);
        if (data.email) {
          setAdminEmail(data.email);
        }
        if (!data.hasAdmin) {
          setAuthState("setup");
        } else if (data.hasAdmin && !data.loggedIn) {
          setAuthState("login");
        }
      }
    } catch (err) {
      console.error("Failed to check admin status:", err);
    } finally {
      setAdminStatusLoading(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isUnlocked && verified) {
      fetchStats();
    }
  }, [isUnlocked, verified]);

  // CRUD Forms State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // Fields state
  const [category, setCategory] = useState("pizza");
  const [nameEn, setNameEn] = useState("");
  const [nameSq, setNameSq] = useState("");
  const [price, setPrice] = useState<number>(750);
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionSq, setDescriptionSq] = useState("");
  const [image, setImage] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);

  // Status state
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Popular image templates to assist the administrator
  const imagePresets = [
    { name: t("admin.presetPizza1"), url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80" },
    { name: t("admin.presetPizza2"), url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
    { name: t("admin.presetDessert"), url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80" },
    { name: t("admin.presetDrink"), url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80" },
  ];

  // SUBMIT FLOWS
  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMessage("");
    setDevSnippet(null);

    if (!authEmailInput || !authPasswordInput || !authConfirmPassword) {
      setAuthError("All input credentials fields are required.");
      return;
    }

    if (!authEmailInput.trim().toLowerCase().endsWith("@gmail.com")) {
      setAuthError("The administrator account must utilize a valid Gmail address (@gmail.com).");
      return;
    }

    if (authPasswordInput !== authConfirmPassword) {
      setAuthError("Password inputs do not match.");
      return;
    }

    if (authPasswordInput.length < 8) {
      setAuthError("For optimal security, password must be at least 8 characters long.");
      return;
    }

    try {
      setIsAuthSubmitting(true);
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmailInput.trim(), password: authPasswordInput })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to initiate administrative setup.");
      } else {
        localStorage.setItem("romana_admin_token", data.token);
        setIsUnlocked(true);
        setVerified(true);
        setAdminEmail(data.email);
        setAuthSuccessMessage("Administrator account configured successfully! Panel unlocked.");
      }
    } catch {
      setAuthError("Network transaction with security server failed.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMessage("");
    setDevSnippet(null);

    if (!authPasswordInput) {
      setAuthError("Password is required.");
      return;
    }

    try {
      setIsAuthSubmitting(true);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: authPasswordInput })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to authenticate credentials.");
      } else {
        localStorage.setItem("romana_admin_token", data.token);
        setIsUnlocked(true);
        setVerified(true);
        setAdminEmail(data.email);
        setAuthSuccessMessage("Authentication successful! Access granted.");
      }
    } catch {
      setAuthError("Auth transmission channel unavailable.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccessMessage("");

    if (!authCodeInput) {
      setAuthError("Please input the 6-digit confirmation pin.");
      return;
    }

    try {
      setIsAuthSubmitting(true);
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, code: authCodeInput })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Verification PIN mismatch. Check your Gmail.");
      } else {
        localStorage.setItem("romana_admin_token", data.token);
        setIsUnlocked(true);
        setVerified(true);
        setAuthSuccessMessage("Welcome Owner! Security clearance active.");
        setAuthCodeInput("");
        setDevSnippet(null);
      }
    } catch {
      setAuthError("PIN verification endpoint timed out.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setAuthError("");
    setAuthSuccessMessage("");
    setDevSnippet(null);

    try {
      setIsAuthSubmitting(true);
      const res = await fetch("/api/admin/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || "Failed to trigger resubmission.");
      } else {
        setAuthSuccessMessage("A fresh verification PIN has been dispatched.");
        if (data.devCode) {
          setDevSnippet(data.devCode);
        }
      }
    } catch {
      setAuthError("Failed to communicate resend intent.");
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignored
    }
    localStorage.removeItem("romana_admin_token");
    setIsUnlocked(false);
    setVerified(false);
    setAuthState("login");
    setAuthEmailInput("");
    setAuthPasswordInput("");
    setAuthConfirmPassword("");
  };

  const resetForm = () => {
    setEditingItemId(null);
    setCategory("pizza");
    setNameEn("");
    setNameSq("");
    setPrice(750);
    setDescriptionEn("");
    setDescriptionSq("");
    setImage("");
    setIsAvailable(true);
    setIsVegetarian(false);
    setIsSpicy(false);
    setIsFormOpen(false);
  };

  // Populate form with item details for editing
  const handleStartEdit = (item: MenuItem) => {
    setEditingItemId(item.id);
    setCategory(item.category);
    setNameEn(item.nameEn);
    setNameSq(item.nameSq);
    setPrice(item.price);
    setDescriptionEn(item.descriptionEn);
    setDescriptionSq(item.descriptionSq);
    setImage(item.image);
    setIsAvailable(item.isAvailable);
    setIsVegetarian(!!item.isVegetarian);
    setIsSpicy(!!item.isSpicy);
    setIsFormOpen(true);
    
    // Quick scroll to the form panel
    const formElement = document.getElementById("admin-editor-form-scroll");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Submit new or updated item to the API backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setSubmitSuccess("");
    setSubmitError("");

    const payload: Partial<MenuItem> = {
      category,
      nameEn,
      nameSq,
      price: Number(price),
      descriptionEn,
      descriptionSq,
      image: image.trim() || undefined,
      isAvailable,
      isVegetarian,
      isSpicy,
    };

    if (editingItemId) {
      payload.id = editingItemId;
    }

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("romana_admin_token")}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Sync failed at database socket");
      }

      await response.json();
      setSubmitSuccess(t("admin.statusSuccess"));
      onItemsChange(); // Reload items list in parent App
      resetForm();
      
      setTimeout(() => {
        setSubmitSuccess("");
      }, 3500);
    } catch (err: any) {
      console.error(err);
      setSubmitError(t("admin.statusError"));
    } finally {
      setIsSyncing(false);
    }
  };

  // Delete item from backend database
  const handleDeleteItem = async (id: string) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;

    setIsSyncing(true);
    setSubmitSuccess("");
    setSubmitError("");

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("romana_admin_token")}`
        }
      });

      if (!response.ok) {
        throw new Error("HTTP Delete failed");
      }

      setSubmitSuccess("Item deleted successfully! Sync complete.");
      onItemsChange(); // Reload parent state
      
      setTimeout(() => {
        setSubmitSuccess("");
      }, 3500);
    } catch {
      setSubmitError("Failed to delete. Try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  // UNLOCKED Admin Panel
  if (isUnlocked) {
    return (
      <section id="admin-workspace-active" className="py-20 bg-brand-beige text-brand-dark border-b border-brand-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-brand-dark mb-10 text-left">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-600 text-white font-mono text-[9px] font-black uppercase px-2.5 py-0.5 border border-brand-dark">
                  {t("admin.unlocked")}
                </span>
                <span className="text-brand-dark/50 text-[10px] font-mono uppercase font-black">OWNER PORTAL TERMINAL</span>
              </div>
              <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight mt-2">
                Romana Control Panel
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                id="lock-dashboard-btn"
                onClick={handleLogOut}
                className="bg-white hover:bg-brand-beige text-brand-dark border-2 border-brand-dark px-4 py-2.5 rounded-none text-xs uppercase tracking-widest font-black cursor-pointer transition-colors hover:shadow-none"
              >
                {t("admin.logout")}
              </button>
              <button
                id="open-creator-form-btn"
                onClick={() => {
                  resetForm();
                  setIsFormOpen(true);
                }}
                className="bg-brand-red hover:bg-brand-red-hover text-white font-black px-5 py-2.5 rounded-none text-xs uppercase tracking-widest flex items-center gap-1.5 cursor-pointer border-2 border-brand-dark shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]"
              >
                <Plus className="w-4 h-4" />
                <span>{t("admin.addItem")}</span>
              </button>
            </div>
          </div>

          {/* WEBSITE VISIT STATISTICS */}
          <div className="bg-white border-2 border-brand-dark p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] mb-10 text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-brand-red font-black block mb-2">
                  ★ TRAFFIC CONTROL
                </span>
                <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight">
                  Total Site Visitors
                </h3>
                <p className="text-xs text-brand-dark/60 uppercase font-extrabold mt-1">
                  Accumulated lifetime page views and customer sessions on Romana Pizza Website.
                </p>
              </div>
              <div className="flex items-center gap-4 self-start md:self-center">
                <div className="bg-brand-beige border-2 border-brand-dark px-6 py-4 flex items-center gap-4">
                  <Eye className="w-8 h-8 text-brand-red" />
                  <div>
                    <span className="block text-[9px] uppercase font-mono tracking-wider text-brand-dark/50 font-black">LIFETIME HITS</span>
                    <span className="text-2xl font-black font-mono text-brand-dark">
                      {statsLoading ? "..." : visits.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="bg-white hover:bg-brand-beige border-2 border-brand-dark p-4 cursor-pointer transition-colors"
                  title="Sync metric tracker"
                >
                  <RefreshCw className={`w-5 h-5 text-brand-dark ${statsLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Editor/Creator form container */}
          <div id="admin-editor-form-scroll" />
          {isFormOpen && (
            <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-brand-dark mb-10 text-left relative shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
              <button
                id="close-editor-form-btn"
                onClick={resetForm}
                className="absolute top-5 right-5 p-2 bg-white border-2 border-brand-dark text-brand-dark hover:bg-brand-red hover:text-white cursor-pointer transition-colors"
                title="Discard configuration"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark flex items-center gap-2 pb-3 border-b-2 border-brand-dark mb-6">
                <Sparkles className="w-5 h-5 text-brand-red" />
                <span>{editingItemId ? t("admin.editItem") : t("admin.addItem")}</span>
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                      {t("admin.lblCategory")}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs font-bold uppercase focus:outline-none"
                    >
                      <option value="pizza">🍕 Artisan Pizzas</option>
                      <option value="sandwich">🥪 Gourmet Sandwiches</option>
                      <option value="salad">🥗 Fresh Salads</option>
                      <option value="pasta">🍝 Pastas & Spaghetti</option>
                      <option value="calzone">🥟 Baked Calzones</option>
                      <option value="traditional">🍗 Traditional & Plates</option>
                      <option value="drink">🍺 Cold Drinks</option>
                      <option value="dessert">🍰 House Desserts</option>
                      <option value="appetizer">🧀 Appetizers & Starters</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                      {t("admin.lblPrice")}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs focus:outline-none font-black font-mono shadow-inner"
                    />
                  </div>

                  {/* Name En */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                      {t("admin.lblNameEn")} (ENGLISH)
                    </label>
                    <input
                      type="text"
                      required
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="e.g. Pizza Prosciutto"
                      className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs font-bold uppercase focus:outline-none"
                    />
                  </div>

                  {/* Name Sq */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                      {t("admin.lblNameSq")} (SHQIP)
                    </label>
                    <input
                      type="text"
                      required
                      value={nameSq}
                      onChange={(e) => setNameSq(e.target.value)}
                      placeholder="p.sh. Pica Proshutë"
                      className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs font-bold uppercase focus:outline-none"
                    />
                  </div>

                  {/* Description En */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                      {t("admin.lblDescEn")} (ENGLISH)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                      placeholder="Enter description in English..."
                      className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs font-medium focus:outline-none resize-none"
                    />
                  </div>

                  {/* Description Sq */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                      {t("admin.lblDescSq")} (SHQIP)
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={descriptionSq}
                      onChange={(e) => setDescriptionSq(e.target.value)}
                      placeholder="Shkruani përshkrimin në Shqip..."
                      className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs font-medium focus:outline-none resize-none"
                    />
                  </div>

                  {/* Image URL with templates */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1.5 font-black">
                        {t("admin.lblImage")} URL
                      </label>
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Paste any dynamic Unsplash image URL or click a template preset below"
                        className="w-full px-4 py-3 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs focus:outline-none font-mono"
                      />
                    </div>

                    {/* Presets Grid */}
                    <div className="p-3.5 bg-brand-beige border border-brand-dark rounded-none">
                      <p className="text-[9px] font-mono uppercase text-brand-dark/60 tracking-widest mb-2 font-black">
                        {t("admin.quickPresets")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {imagePresets.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImage(preset.url)}
                            className="bg-white hover:bg-brand-dark hover:text-white border border-brand-dark px-3 py-1 text-[9px] font-bold uppercase transition-all cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dietary Tags and Availability toggles */}
                <div className="flex flex-wrap items-center gap-6 p-4 bg-brand-beige border-2 border-brand-dark rounded-none">
                  {/* Is Available toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 rounded-none text-brand-red border-2 border-brand-dark bg-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono uppercase font-black text-brand-dark tracking-wider select-none">
                      {t("admin.lblAvailable")}
                    </span>
                  </label>

                  {/* Is Vegetarian toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isVegetarian}
                      onChange={(e) => setIsVegetarian(e.target.checked)}
                      className="w-4 h-4 rounded-none text-brand-red border-2 border-brand-dark bg-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono uppercase font-black text-brand-dark tracking-wider select-none">
                      {t("admin.lblVeg")} 🍃
                    </span>
                  </label>

                  {/* Is Spicy toggle */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isSpicy}
                      onChange={(e) => setIsSpicy(e.target.checked)}
                      className="w-4 h-4 rounded-none text-brand-red border-2 border-brand-dark bg-white focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-mono uppercase font-black text-brand-dark tracking-wider select-none">
                      {t("admin.lblSpicy")} 🔥
                    </span>
                  </label>
                </div>

                {/* Submit actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-white hover:bg-brand-beige text-brand-dark border-2 border-brand-dark px-5 py-3 rounded-none text-xs uppercase tracking-widest font-black transition-colors cursor-pointer"
                  >
                    {t("admin.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="bg-brand-red hover:bg-brand-red-hover text-white border-2 border-brand-dark px-6 py-3 rounded-none text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{t("admin.saveItem")}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feedbacks Alerts */}
          {submitSuccess && (
            <div className="mb-6 p-4 bg-emerald-600 text-white border-2 border-brand-dark rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}
          {submitError && (
            <div className="mb-6 p-4 bg-brand-red text-white border-2 border-brand-dark rounded-none text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_rgba(26,26,26,1)]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Listed Table of Items */}
          <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden text-left font-sans">
            <h3 className="text-lg font-black uppercase tracking-tight text-brand-dark mb-6 flex items-center justify-between pb-3 border-b-2 border-brand-dark">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-red" />
                <span>Active Menu Items & Layout Sorting</span>
              </div>
              <span className="text-xs font-mono text-brand-dark/50 uppercase font-black tracking-wide bg-brand-beige border border-brand-dark px-2 py-0.5">
                {menuItems.length} ALL ITEMS
              </span>
            </h3>

            {/* Responsive Table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-brand-dark text-brand-dark font-mono uppercase font-black text-left">
                    <th className="py-3 px-3">Item Image</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Names (English / Shqip)</th>
                    <th className="py-3 px-3 text-right">Price (ALL)</th>
                    <th className="py-3 px-3 text-center font-bold">Stock</th>
                    <th className="py-3 px-3 text-center font-bold">Sequence Order</th>
                    <th className="py-3 px-3 text-center font-bold">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark/10">
                  {menuItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-brand-beige/50 transition-colors">
                      {/* Photo */}
                      <td className="py-3 px-3">
                        <div className="w-14 h-11 rounded-none overflow-hidden bg-brand-beige border border-brand-dark">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.nameEn}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-dark/10 flex items-center justify-center font-mono text-[8px] text-brand-dark/40 font-black uppercase">
                              No image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* category code */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[9px] bg-brand-beige text-brand-dark border border-brand-dark px-1.5 py-0.5 uppercase font-black">
                          {item.category}
                        </span>
                      </td>

                      {/* Name columns */}
                      <td className="py-3 px-3 space-y-1 max-w-xs">
                        <div className="font-black text-brand-dark text-sm truncate animate-none" title={item.nameEn}>
                          {item.nameEn}
                        </div>
                        <div className="text-brand-dark/60 text-xs font-semibold truncate" title={item.nameSq}>
                          {item.nameSq}
                        </div>
                        {/* tags */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          {item.isVegetarian && (
                            <span className="text-[8px] font-mono uppercase font-black bg-emerald-600 text-white px-1.5 py-0.5">Veg</span>
                          )}
                          {item.isSpicy && (
                            <span className="text-[8px] font-mono uppercase font-black bg-brand-red text-white px-1.5 py-0.5">Spicy</span>
                          )}
                        </div>
                      </td>

                      {/* pricing */}
                      <td className="py-3 px-3 text-right font-black text-brand-red font-mono text-sm">
                        {item.price} ALL
                      </td>

                      {/* availability indicator */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block w-2.5 h-2.5 rounded-none border border-brand-dark ${
                          item.isAvailable ? "bg-emerald-500" : "bg-brand-red"
                        }`} title={item.isAvailable ? "In stock" : "Sold out"} />
                      </td>

                      {/* Sequence sorting controls */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          <button
                            disabled={index === 0 || isSorting}
                            onClick={() => handleMoveUp(index)}
                            className="p-1.5 bg-white hover:bg-brand-beige text-brand-dark border border-brand-dark disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={index === menuItems.length - 1 || isSorting}
                            onClick={() => handleMoveDown(index)}
                            className="p-1.5 bg-white hover:bg-brand-beige text-brand-dark border border-brand-dark disabled:opacity-30 disabled:hover:bg-white transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Control keys */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 bg-white hover:bg-brand-dark hover:text-white border border-brand-dark text-brand-dark transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 bg-white hover:bg-brand-red hover:text-white border border-brand-dark text-brand-dark transition-colors cursor-pointer"
                            title="Remove completely"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {menuItems.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-brand-dark/50 font-mono text-xs uppercase tracking-widest font-black">
                        Database empty. Click "Add Custom Item" above to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>
    );
  }

  // LOCKED Entry Shield Prompt
  if (adminStatusLoading) {
    return (
      <section className="py-20 bg-brand-beige text-brand-dark min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-brand-red animate-spin" />
          <span className="font-mono text-xs uppercase font-black tracking-widest text-brand-dark/50">
            Checking Administrator Clearance...
          </span>
        </div>
      </section>
    );
  }

  return (
    <section id="admin-workspace-locked" className="py-20 bg-brand-beige text-brand-dark">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        
        {/* Core Locked Interface card */}
        <div className="bg-white p-6 sm:p-10 border-2 border-brand-dark text-center space-y-6 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] relative overflow-hidden">
          
          <div className="mx-auto w-14 h-14 bg-brand-dark text-white border-2 border-brand-dark flex items-center justify-center">
            <Lock className="w-5 h-5 text-brand-red animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-red bg-brand-beige border border-brand-dark px-3 py-1 font-black">
              {t("admin.locked")}
            </span>
            <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight">
              {t("admin.accessTitle")}
            </h3>
            <p className="text-brand-dark/70 text-xs sm:text-xs font-black uppercase leading-relaxed max-w-sm mx-auto">
              Owner password authentication required to unlock terminal configurations.
            </p>
          </div>

          {/* Password Login Frame */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-xs mx-auto text-left">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-brand-dark/70 font-black mb-1">Secret Password:</label>
              <input
                type="password"
                required
                value={authPasswordInput}
                onChange={(e) => setAuthPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 bg-white border-2 border-brand-dark text-brand-dark text-xs sm:text-sm font-bold shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] focus:outline-none focus:shadow-none transition-all"
              />
            </div>

            {authError && (
              <div className="text-xs text-white bg-brand-red border-2 border-brand-dark p-2.5 font-bold uppercase tracking-wider leading-tight text-center">
                ⚠️ {authError}
              </div>
            )}

            {authSuccessMessage && (
              <div className="text-xs text-stone-900 bg-amber-100 border-2 border-amber-400 p-2.5 font-bold uppercase tracking-wider leading-tight text-center">
                ✅ {authSuccessMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthSubmitting}
              className="w-full bg-brand-dark hover:bg-brand-red text-white border-2 border-brand-dark font-black py-3 text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(217,65,38,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-center"
            >
              {isAuthSubmitting ? "Authenticating..." : "Sign-In Console"}
            </button>
          </form>

          {/* Sandbox assist banner - displayed if mail is bypassed to allow instant setup */}
          {devSnippet && (
            <div className="bg-emerald-50 text-emerald-900 border-2 border-emerald-400 p-4 font-mono text-left space-y-1 select-all">
              <span className="font-sans text-[10px] font-black uppercase text-emerald-800 block">✨ SANDBOX ASSIST - SMTP UNCONFIGURED</span>
              <p className="text-[11px] leading-relaxed uppercase">
                We're running in a development sandbox. The direct verification code generated is: 
              </p>
              <span className="block text-center text-lg font-black tracking-widest text-emerald-600 font-mono mt-1 bg-white border border-emerald-200 py-1">{devSnippet}</span>
            </div>
          )}

          <p className="text-brand-dark/50 text-[10px] sm:text-xs font-mono uppercase font-semibold">
            Secure pizza admin panel terminal. Authorized connection.
          </p>
        </div>

      </div>
    </section>
  );
}
