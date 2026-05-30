import React, { useState, useEffect } from "react";
import { 
  MapPin, Phone, Clock, Compass, Star,
  MessageSquare, User, Calendar, Map, Check
} from "lucide-react";
import { Language } from "../types";
import { translations } from "../languages";

interface AboutContactProps {
  currentLanguage: Language;
}

interface GuestReview {
  id: string;
  name: string;
  score: number;
  comment: string;
  date: string;
}

export default function AboutContact({ currentLanguage }: AboutContactProps) {
  const t = (key: string) => translations[currentLanguage]?.[key] || key;
  
  // Local list of reviews initialized with defaults + loading localStorage
  const [reviews, setReviews] = useState<GuestReview[]>([]);
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewScore, setNewReviewScore] = useState(5);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Standard default starter reviews
    const defaultReviews: GuestReview[] = [
      {
        id: "default-1",
        name: t("reviews.reviewer1"),
        score: 5,
        comment: t("reviews.comment1"),
        date: "2026-05-15",
      },
      {
        id: "default-2",
        name: t("reviews.reviewer2"),
        score: 5,
        comment: t("reviews.comment2"),
        date: "2026-04-28",
      },
      {
        id: "default-3",
        name: t("reviews.reviewer3"),
        score: 4,
        comment: t("reviews.comment3"),
        date: "2026-04-12",
      },
    ];

    try {
      const stored = localStorage.getItem("romana_pizza_submitted_reviews");
      if (stored) {
        const parsed = JSON.parse(stored);
        setReviews([...defaultReviews, ...parsed]);
      } else {
        setReviews(defaultReviews);
      }
    } catch {
      setReviews(defaultReviews);
    }
  }, [currentLanguage]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev: GuestReview = {
      id: Date.now().toString(),
      name: newReviewName,
      score: newReviewScore,
      comment: newReviewComment,
      date: new Date().toISOString().split("T")[0],
    };

    const localOnly = [];
    try {
      const stored = localStorage.getItem("romana_pizza_submitted_reviews");
      if (stored) {
        localOnly.push(...JSON.parse(stored));
      }
    } catch {}

    localOnly.unshift(newRev);
    localStorage.setItem("romana_pizza_submitted_reviews", JSON.stringify(localOnly));

    // Combine local default list (with translated values if refreshed) with new reviews
    setReviews((prev) => [
      prev[0], // arben
      prev[1], // sarah
      prev[2], // elora
      newRev,
      ...prev.slice(3)
    ]);

    setNewReviewName("");
    setNewReviewComment("");
    setNewReviewScore(5);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 4000);
  };

  return (
    <section id="about" className="py-20 bg-brand-beige text-brand-dark border-b border-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Group in Swiss Grid Bold style */}
        <div className="max-w-3xl mb-16 space-y-4 text-left">
          <span className="text-brand-red text-xs sm:text-sm font-black font-mono tracking-widest uppercase block">
            ★ ABOUT & VISITING ROMANA
          </span>
          <h2 id="about-title" className="text-4xl sm:text-5xl font-black text-brand-dark tracking-tighter uppercase font-sans">
            {t("about.title")}
          </h2>
          <p id="about-desc" className="text-brand-dark/80 text-base sm:text-lg leading-relaxed font-sans font-medium">
            {t("about.description")}
          </p>
        </div>

        {/* Main contact grid split into info, interactive visual maps mock, and ratings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-20 items-stretch">
          
          {/* Contact and Operational Details (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] space-y-8 flex-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-white bg-brand-dark py-2 px-3 flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-red shrink-0" />
                <span>Restaurant Info</span>
              </h3>

              {/* Detail Items */}
              <div id="contact-list" className="space-y-6">
                {/* Hours info */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-beige border border-brand-dark text-brand-dark shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-brand-dark/50 tracking-widest font-black">
                      {t("about.workingHours")}
                    </h4>
                    <p className="text-brand-dark text-sm sm:text-base font-black mt-1 uppercase">
                      {t("about.hoursValue")}
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-beige border border-brand-dark text-brand-dark shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-brand-dark/50 tracking-widest font-black">
                      {t("about.phone")}
                    </h4>
                    <p className="text-brand-red text-base sm:text-lg font-black mt-1 tracking-wide">
                      +355 69 688 5195
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-beige border border-brand-dark text-brand-dark shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-brand-dark/50 tracking-widest font-black">
                      {t("about.address")}
                    </h4>
                    <p className="text-brand-dark text-sm sm:text-base font-black mt-1 uppercase">
                      {t("about.addressValue")}
                    </p>
                    <span className="inline-block bg-brand-beige border border-brand-dark text-brand-dark px-2 py-0.5 mt-2 text-[10px] font-mono uppercase font-bold">
                      Plus Code: 8QGH+7V Tirana
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct call banner */}
              <div className="p-5 bg-brand-beige border-2 border-brand-dark rounded-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div>
                  <h5 className="text-brand-dark font-black uppercase text-xs tracking-tight">HUNGRY FOR ARTISAN PIZZA?</h5>
                  <p className="text-brand-dark/70 text-xs font-medium uppercase mt-0.5 leading-tight">CALL US DIRECTLY FOR TAKEOUT OR RAPID PICKUP OR COURIERS.</p>
                </div>
                <a
                  href="tel:+355696885195"
                  className="bg-brand-red hover:bg-brand-red-hover text-white font-black px-4 py-2.5 rounded-none border border-brand-dark transition-all text-center text-xs tracking-widest uppercase cursor-pointer shrink-0"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Custom Maps Mock (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white p-6 sm:p-8 rounded-none border-2 border-brand-dark shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] flex flex-col justify-between h-full space-y-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white bg-brand-dark py-2 px-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-brand-red" />
                    <span>{t("about.findUs")}</span>
                  </div>
                  <span className="text-[9px] font-mono tracking-widest text-emerald-400 bg-white/10 px-2 py-0.5 uppercase font-bold">
                    SECURE PATH
                  </span>
                </h3>
                <p className="text-brand-dark/70 text-xs mt-3 uppercase tracking-tight font-bold">
                  LOCATED IN A CENTRAL SEGMENT OF TIRANA. SIMPLY CLICK LAUNCH DIRECtions to start navigation.
                </p>
              </div>

              {/* Designer Styled Map Mock */}
              <div className="relative w-full h-64 bg-brand-beige border-2 border-brand-dark rounded-none overflow-hidden flex items-center justify-center p-2 group shadow-inner">
                {/* Map grid lines layout */}
                <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: "radial-gradient(#D94126 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
                
                {/* Fake street block layouts */}
                <div className="absolute inset-0 pointer-events-none opacity-30 flex flex-col justify-around">
                  <div className="h-[2px] bg-brand-dark w-full transform -rotate-6" />
                  <div className="h-[2px] bg-brand-dark w-full transform rotate-35" />
                  <div className="w-[2px] bg-brand-dark h-full absolute left-1/3" />
                  <div className="w-[2px] bg-brand-dark h-full absolute right-1/4" />
                </div>
                
                {/* Park Area */}
                <div className="absolute top-10 left-16 w-32 h-16 bg-emerald-500/10 border-2 border-dashed border-emerald-550/20 rounded-none pointer-events-none" />

                <span className="absolute top-4 left-6 text-[9px] font-mono text-brand-dark/40 uppercase font-black tracking-widest">Tirana Central Segment</span>
                <span className="absolute bottom-12 right-8 text-[9px] font-mono text-brand-dark/40 uppercase font-black tracking-widest">Blvd Bajram Curri</span>

                {/* Romana Pizza Pin Callout */}
                <div className="relative z-10 bg-white px-4 py-3 rounded-none border-2 border-brand-dark flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] animate-pulse">
                  <div className="p-2 bg-brand-red text-white font-black">
                    ★
                  </div>
                  <div className="text-left">
                    <h5 className="font-black text-brand-dark text-xs tracking-tight uppercase">ROMANA PIZZA</h5>
                    <p className="text-brand-red text-[10px] font-mono leading-none mt-1 font-black">★ 4.6 (40 REVIEWS)</p>
                    <p className="text-brand-dark/60 text-[9px] mt-0.5 font-bold uppercase">Rruga Ëngjëll Marashi</p>
                  </div>
                </div>

                {/* Open in maps overlay button */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center">
                  <a
                    href="https://maps.google.com/?q=Romana+Pizza,+Rruga+Engjell+Marashi,+Tirane"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-brand-dark text-white border border-brand-dark hover:bg-brand-red hover:text-white px-4 py-2 text-xs transition-all font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(217,65,38,1)] hover:shadow-none"
                  >
                    🚀 LAUNCH GOOGLE MAPS
                  </a>
                </div>
              </div>

              {/* History information block with clean design */}
              <div className="p-4 bg-brand-beige border-2 border-brand-dark rounded-none text-left">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 block font-black">
                  ★ {t("about.history")}
                </span>
                <p className="text-brand-dark text-xs mt-1 uppercase tracking-tight font-bold leading-relaxed">
                  {t("about.historyValue")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Experiences / Reviews Block */}
        <div id="reviews-dashboard" className="bg-white border-2 border-brand-dark rounded-none p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)]">
          <div className="text-left max-w-3xl mb-12">
            <span className="text-brand-red font-mono text-xs uppercase tracking-widest font-black block">
              ★ {t("reviews.subtitle")}
            </span>
            <h3 className="text-3xl font-black text-brand-dark uppercase tracking-tight mt-1 font-sans">
              {t("reviews.title")}
            </h3>
            <p className="text-brand-dark/60 text-xs font-bold uppercase tracking-wider mt-1">
              {t("reviews.reviewsCount")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Reviews display board (7 cols) */}
            <div className="lg:col-span-7 space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar text-left">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-5 bg-brand-beige border-2 border-brand-dark rounded-none flex items-start gap-4 hover:border-brand-red transition-all duration-150 relative">
                  <div className="p-2 bg-brand-dark text-white font-black shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-extrabold text-brand-dark text-sm sm:text-base leading-none uppercase">
                        {rev.name}
                      </h4>
                      <span className="text-[9px] font-mono text-brand-dark/40 flex items-center gap-1 uppercase font-black tracking-widest">
                        <Calendar className="w-3 h-3 text-brand-dark/40" />
                        {rev.date}
                      </span>
                    </div>

                    {/* Stars rating */}
                    <div className="flex items-center gap-0.5 mt-1.5 mb-2.5">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star 
                          key={index} 
                          className={`w-3.5 h-3.5 ${
                            index < rev.score 
                              ? "text-brand-red fill-current" 
                              : "text-brand-dark/20"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-brand-dark font-serif text-sm sm:text-base leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Leave a review portal (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-brand-beige p-6 border-2 border-brand-dark rounded-none text-left">
                <h4 className="text-sm font-black uppercase text-brand-dark tracking-wider flex items-center gap-2 mb-6">
                  <MessageSquare className="w-4 h-4 text-brand-red" />
                  <span>{t("reviews.writeReview")}</span>
                </h4>

                <form onSubmit={handleAddReview} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1 font-black">
                      YOUR FULL NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="e.g. Sokol Gashi"
                      className="w-full px-4 py-2.5 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs focus:outline-none placeholder-brand-dark/30 font-bold uppercase shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1 font-black">
                      EXPERIENCE SCORE
                    </label>
                    <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-none border-2 border-brand-dark shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewScore(star)}
                            className="focus:outline-none cursor-pointer p-0.5"
                          >
                            <Star 
                              className={`w-5 h-5 transform active:scale-95 transition-all ${
                                star <= newReviewScore 
                                  ? "text-brand-red fill-current" 
                                  : "text-brand-dark/20 hover:text-brand-red/55"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-brand-dark/60 text-[10px] font-mono font-black uppercase ml-auto">
                        {newReviewScore} / 5 STARS
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-brand-dark/60 mb-1 font-black">
                      YOUR COMMENTS
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Tell locals what you loved about our artisan sourdough base or service!"
                      className="w-full px-4 py-2.5 rounded-none bg-white border-2 border-brand-dark text-brand-dark text-xs focus:outline-none placeholder-brand-dark/30 font-bold uppercase resize-none shadow-[2px_2px_0px_0px_rgba(26,26,26,1)]"
                    />
                  </div>

                  {submitSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500 text-emerald-700 rounded-none text-xs font-bold uppercase leading-tight">
                      Review posted successfully to local listings!
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-brand-red hover:bg-brand-red-hover text-white font-black py-3.5 px-4 rounded-none border-2 border-brand-dark text-xs uppercase tracking-widest transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(26,26,26,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    Post Guest Review
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
