import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, Heart, Award, Coffee, Activity, ChevronRight, 
  CheckCircle2, HeartHandshake, Calculator, ShieldCheck, 
  Sparkles, Sparkle, Trophy, FileBadge, Info
} from "lucide-react";
import BloodHeroAnimation from "./BloodHeroAnimation";

interface HomeHeroProps {
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  lang: "bn" | "en";
  translations: any;
}

export default function HomeHero({ setCurrentTab, onOpenAuth, lang, translations }: HomeHeroProps) {
  // Blood Compatibility Matrix Data
  const COMPATIBILITY_CHART = [
    { group: "A+", giveTo: "A+, AB+", receiveFrom: "A+, A-, O+, O-" },
    { group: "O+", giveTo: "A+, B+, AB+, O+", receiveFrom: "O+, O-" },
    { group: "B+", giveTo: "B+, AB+", receiveFrom: "B+, B-, O+, O-" },
    { group: "AB+", giveTo: "AB+", receiveFrom: "Everyone (Universal Receiver)" },
    { group: "A-", giveTo: "A+, A-, AB+, AB-", receiveFrom: "A-, O-" },
    { group: "O-", giveTo: "Everyone (Universal Donor)", receiveFrom: "O-" },
    { group: "B-", giveTo: "B+, B-, AB+, AB-", receiveFrom: "B-, O-" },
    { group: "AB-", giveTo: "AB+, AB-", receiveFrom: "AB-, A-, B-, O-" },
  ];

  // Calculator states
  const [calcGroup, setCalcGroup] = useState<string>("B+");
  const [calcWeight, setCalcWeight] = useState<number>(65);
  const [calcAge, setCalcAge] = useState<number>(24);
  const [calcGender, setCalcGender] = useState<"male" | "female">("male");
  const [calcResult, setCalcResult] = useState<{
    bloodVolume: number;
    livesSaved: number;
    eligibilityStatus: string;
    advice: string;
  } | null>(null);

  // Pledge checklist states
  const [pledges, setPledges] = useState({
    regular: false,
    healthy: false,
    emergency: false,
    awareness: false
  });
  const [showCertificate, setShowCertificate] = useState(false);

  // Handle donation math
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (calcAge < 18 || calcAge > 65) {
      setCalcResult({
        bloodVolume: 0,
        livesSaved: 0,
        eligibilityStatus: lang === "bn" ? "রক্তদানের অযোগ্য" : "Not eligible due to age",
        advice: lang === "bn" 
          ? "রক্ত দান করার জন্য সাধারণ বয়সসীমা ১৮ থেকে ৬৫ বছর।" 
          : "Standard range of blood donors is 18 to 65 years.",
      });
      return;
    }
    if (calcWeight < 45) {
      setCalcResult({
        bloodVolume: 0,
        livesSaved: 0,
        eligibilityStatus: lang === "bn" ? "রক্তদানের অযোগ্য" : "Ineligible weight count",
        advice: lang === "bn"
          ? "রক্ত দানের জন্য দাতার ন্যূনতম ওজন ৪৫ কেজি হওয়া প্রয়োজন।"
          : "Minimum weight required to donate is 45 kilograms.",
      });
      return;
    }

    // Estimate blood volume (rough clinical estimate)
    const factor = calcGender === "male" ? 75 : 65; // ml per kg
    const totalVolumeLiters = Number(((calcWeight * factor) / 1000).toFixed(2));
    const potentialLives = 3; // 1 blood bag can save up to 3 lives (red blood cells, platelets, plasma)

    const healthyAdvice = lang === "bn"
      ? `আপনার রক্তের গ্রুপ ${calcGroup}। রক্ত দিলে আপনার শরীর থেকে মাত্র ৩৫০-৪৫০ মিলি রক্ত নেওয়া হবে, যা আপনার মোট রক্তের মাত্র ৭-৮% এবং এটি ২১ দিনের মধ্যে পুনরায় পূরণ হয়ে যাবে!`
      : `Your blood group is ${calcGroup}. A donation extracts only 350-450 ml (around 7-8% of total volume), which completely regenerates in just 21 days!`;

    setCalcResult({
      bloodVolume: totalVolumeLiters,
      livesSaved: potentialLives,
      eligibilityStatus: lang === "bn" ? "রক্তদানের জন্য যোগ্য" : "Fully Eligible to Donate",
      advice: healthyAdvice
    });
  };

  const allPledgesChecked = pledges.regular && pledges.healthy && pledges.emergency && pledges.awareness;

  return (
    <div className="space-y-16 py-4" id="home-landing-viewport">
      {/* 1. High-Impact Main Hero Frame with Seamless Blending & Dynamic Color-Shifting Background */}
      <motion.section 
        animate={{
          background: [
            "linear-gradient(135deg, rgba(255, 241, 242, 0.9) 0%, rgba(255, 255, 255, 1) 50%, rgba(254, 242, 242, 0.85) 100%)",
            "linear-gradient(135deg, rgba(255, 237, 213, 0.8) 0%, rgba(255, 241, 242, 0.9) 50%, rgba(254, 249, 195, 0.7) 100%)",
            "linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 228, 230, 0.8) 100%)",
            "linear-gradient(135deg, rgba(254, 243, 199, 0.7) 0%, rgba(255, 241, 242, 0.85) 50%, rgba(254, 242, 242, 0.9) 100%)",
            "linear-gradient(135deg, rgba(255, 241, 242, 0.9) 0%, rgba(255, 255, 255, 1) 50%, rgba(254, 242, 242, 0.85) 100%)",
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="rounded-3xl p-8 md:p-12 lg:p-16 border border-rose-100/50 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 shadow-xl shadow-red-100/20" 
        id="hero-banner-frame"
      >
        {/* Dynamic Color-Morphing Fluid Blobs */}
        <motion.div 
          animate={{
            scale: [1, 1.25, 0.9, 1.15, 1],
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            backgroundColor: [
              "rgba(254, 205, 211, 0.65)",
              "rgba(254, 215, 170, 0.55)",
              "rgba(254, 240, 138, 0.45)",
              "rgba(253, 164, 175, 0.6)",
              "rgba(254, 205, 211, 0.65)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div 
          animate={{
            scale: [1, 0.85, 1.3, 0.95, 1],
            x: [0, -25, 30, -15, 0],
            y: [0, 20, -15, 25, 0],
            backgroundColor: [
              "rgba(254, 226, 226, 0.7)",
              "rgba(254, 243, 199, 0.5)",
              "rgba(255, 228, 230, 0.65)",
              "rgba(254, 215, 170, 0.5)",
              "rgba(254, 226, 226, 0.7)"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        />

        <div className="space-y-6 flex-1 text-center lg:text-left relative z-10">
          {/* Tagline */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-extrabold tracking-wider uppercase font-sans border border-red-100 shadow-xs">
            ❤️ {lang === "bn" ? "রক্তদান জীবন বাঁচায়" : "Save a Life Today"}
          </span>

          {/* Catchphrase Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-tight">
            {lang === "bn" ? (
              <>
                জীবন বাঁচাতে <span className="text-red-600 drop-shadow-xs">রক্ত দিন</span>,<br />
                মানবতায় হাত বাড়ান
              </>
            ) : (
              <>
                Donate <span className="text-red-600 drop-shadow-xs">Blood</span>,<br />
                Save Lives & Connect
              </>
            )}
          </h1>

          <p className="text-gray-600 text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            {lang === "bn"
              ? "রক্তদান জীবন একটি আধুনিক ও উন্মুক্ত পূর্ণ-স্ট্যাক পোর্টাল যা রক্তদাতা এবং রক্তগ্রহীতাদের মাঝে একটি তাৎক্ষণিক সমন্বয় তৈরি করে। আপনার একটি ব্যাগ রক্ত বাঁচাতে পারে একটি মুমূর্ষু মানুষের জীবন।"
              : "BloodLife is a comprehensive, modern full-stack network connecting clinical volunteer donors with regional emergencies in minutes."}
          </p>

          {/* Buttons Ribbon */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
            <button
              onClick={() => setCurrentTab("search")}
              id="search-donors-hero-btn"
              className="px-6 py-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold rounded-xl shadow-lg shadow-red-200/80 hover:shadow-xl hover:shadow-red-300 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Search size={18} />
              {translations.findDonor}
            </button>

            <button
              onClick={onOpenAuth}
              id="become-donor-hero-btn"
              className="px-6 py-4 bg-white border-2 border-gray-100 hover:border-[#D32F2F] text-gray-800 hover:text-[#D32F2F] font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <HeartHandshake className="text-[#D32F2F] animate-bounce" size={18} />
              {translations.beADonor}
            </button>
          </div>
        </div>

        {/* Hero Seamless Transparent Animation Showcase */}
        <div className="flex-1 w-full flex justify-center items-center relative z-10" id="hero-graphics-container">
          <div className="w-full max-w-md sm:max-w-lg relative flex items-center justify-center">
            <BloodHeroAnimation lang={lang} />

            {/* Elegant floating status badges integrated seamlessly */}
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-md text-red-600 px-3.5 py-1.5 rounded-full shadow-lg shadow-red-100/60 border border-red-100 text-xs font-black tracking-wider leading-none flex items-center gap-1.5 font-sans"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              A+ • O- • B+ • AB+
            </motion.div>

            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white/90 backdrop-blur-md text-emerald-700 px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-100/60 border border-emerald-100 text-xs font-black tracking-wide leading-none flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {lang === "bn" ? "নিরাপদ ১২০ দিন রিকভারি" : "Safe 120 Days Recovery"}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 2. Custom Section: New Blood Volume & Impact Dynamics Calculator */}
      <section className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-slate-100/30" id="impact-calculator-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold font-sans">
              <Calculator size={14} /> {lang === "bn" ? "অত্যাধুনিক ক্যালকুলেটর" : "Smart Estimator"}
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              {lang === "bn" 
                ? "আপনার রক্তদানের প্রভাব ও শক্তি হিসাব করুন" 
                : "Evaluate Your Blood Count & Saving Potential"}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed font-medium">
              {lang === "bn"
                ? "আপনার মৌলিক শারীরিক ক্রাইটেরিয়া প্রদান করে আপনার আনুমানিক সুস্থ রক্তকণিকার আয়তন জানুন এবং রক্ত দিলে কতটি জীবন সরাসরি উপকৃত হবে তা নিখুঁতভাবে পরীক্ষা করুন।"
                : "Enter your health attributes safely to calculate your core healthy blood volume, check criteria eligibility and preview real life-saving impact."}
            </p>

            <div className="p-4 bg-red-50/40 rounded-2xl border border-red-100/50 flex gap-3">
              <Info className="text-[#D32F2F] shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] text-gray-600 leading-normal">
                {lang === "bn"
                  ? "বিজ্ঞান অনুযায়ী রক্তদান পরবর্তী মাত্র ৪৮ ঘন্টার মধ্যে প্লাজমার লেভেল স্বাভাবিক হয়ে যায় এবং রক্তের লোহিত কণিকা ১ মাসের মধ্যেই পুরোপুরি পূরণ হয়।"
                  : "Clinically, blood plasma regenerates fully within 48 hours, while new red blood cells complete their synthesis in around 4-6 weeks."}
              </p>
            </div>
          </div>

          <div className="lg:col-span-1"></div>

          {/* Calculator form panel */}
          <div className="lg:col-span-6 bg-slate-50/50 p-6 md:p-8 rounded-2xl border border-gray-100 relative overflow-hidden">
            <form onSubmit={handleCalculate} className="space-y-4 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                {/* Weight */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "bn" ? "ওজন (কেজি)" : "Your Weight (KG)"}
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="150"
                    required
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] focus:border-[#D32F2F] font-sans"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "bn" ? "বয়স (বছর)" : "Your Age (Years)"}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    required
                    value={calcAge}
                    onChange={(e) => setCalcAge(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] focus:border-[#D32F2F] font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {lang === "bn" ? "লিঙ্গ" : "Your Gender"}
                  </label>
                  <select
                    value={calcGender}
                    onChange={(e) => setCalcGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] focus:border-[#D32F2F]"
                  >
                    <option value="male">{lang === "bn" ? "পুরুষ (Male)" : "Male"}</option>
                    <option value="female">{lang === "bn" ? "নারী (Female)" : "Female"}</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {translations.bloodGroup}
                  </label>
                  <select
                    value={calcGroup}
                    onChange={(e) => setCalcGroup(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] focus:border-[#D32F2F]"
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-extrabold tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calculator size={15} />
                {lang === "bn" ? "হিসাব করুন" : "Calculate Stats"}
              </button>
            </form>

            <AnimatePresence mode="wait">
              {calcResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 p-5 bg-white rounded-xl border border-gray-100 flex flex-col gap-4 relative z-10"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{lang === "bn" ? "বিশ্লেষণ ফলাফল:" : "CLINICAL EVALUATION:"}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${calcResult.bloodVolume > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-[#D32F2F] border border-rose-100"}`}>
                      {calcResult.eligibilityStatus}
                    </span>
                  </div>

                  {calcResult.bloodVolume > 0 && (
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-rose-50/50 p-3 rounded-lg border border-red-100/30">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{lang === "bn" ? "মোট রক্ত (আনুমানিক)" : "Total Est. Blood"}</span>
                        <p className="text-xl font-black text-red-600 font-sans mt-0.5">{calcResult.bloodVolume} Liters</p>
                      </div>
                      <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/30">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{lang === "bn" ? "সম্ভাব্য জীবন রক্ষা" : "Lives You Can Save"}</span>
                        <p className="text-xl font-black text-emerald-600 font-sans mt-0.5">{calcResult.livesSaved} Lives</p>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 leading-normal font-medium bg-slate-50 p-3 rounded-lg ">
                    {calcResult.advice}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 3. Three Column Perks Ribbon */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8" id="features-highlights">
        {/* Perk 1 */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4 hover:border-red-200 transition-colors group">
          <div className="w-12 h-12 bg-red-50 group-hover:bg-red-500 group-hover:text-white transition-all duration-300 rounded-xl flex items-center justify-center text-[#D32F2F]">
            <Award size={24} />
          </div>
          <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-red-600 transition-colors">
            {lang === "bn" ? "স্বাস্থ্য উপকারিতা" : "Health Benefits"}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            {lang === "bn"
              ? "নিয়মিত রক্তদান করলে শরীরে অতিরিক্ত আয়রনের ভারসাম্য বজায় থাকে, যা হৃদরোগ এবং ক্যান্সারের ঝুঁকি মারাত্মকভাবে হ্রাস করে শরীর সচল রাখে।"
              : "Regular blood donations regulates cumulative iron counts which matches standard diagnostic profiles and minimizes malignant risks."}
          </p>
        </div>

        {/* Perk 2 */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4 hover:border-amber-200 transition-colors group">
          <div className="w-12 h-12 bg-amber-50 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 rounded-xl flex items-center justify-center text-amber-500">
            <Coffee size={24} />
          </div>
          <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-amber-600 transition-colors">
            {lang === "bn" ? "নতুন রক্তকণিকা তৈরি" : "Cell Regeneration"}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            {lang === "bn"
              ? "রক্ত দানের পর শরীরের অস্থিমজ্জা সক্রিয় হয়ে ওঠে এবং দ্রুত ৫-১০ দিনের মধ্যেই নতুন কোষে রক্তের ঘাটতি পূরণ করে রোগ প্রতিরোধ ক্ষমতা বাড়ায়।"
              : "The bone marrow actively triggers post donation, synthesizing fresh red cells and healthy active platelets instantly."}
          </p>
        </div>

        {/* Perk 3 */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4 hover:border-emerald-200 transition-colors group">
          <div className="w-12 h-12 bg-emerald-50 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 rounded-xl flex items-center justify-center text-emerald-600">
            <Activity size={24} />
          </div>
          <h3 className="font-extrabold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">
            {lang === "bn" ? "সহজ ম্যাচিং সিস্টেম" : "Optimized Matching"}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed font-medium">
            {lang === "bn"
              ? "আমাদের সুসংগঠিত রক্তদাতা সন্ধান ফিল্টার রক্তগ্রহীতাকে কয়েক সেকেন্ডের মধ্যে এলাকার সঠিক রক্তের গ্রুপ বিশিষ্ট মোবাইল ভ্যারিফাইড দাতাদের কাছে নিয়ে যায়।"
              : "Locates registered members instantly. Filter and contact matching dynamic blood groups by target districts in mere seconds."}
          </p>
        </div>
      </section>

      {/* 4. New Custom Interactive Section: Community Pledge & Digital Badge */}
      <section className="bg-gradient-to-tr from-slate-900 via-slate-950 to-red-950 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden" id="pledge-wall-section">
        {/* Soft graphical elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/40 text-red-400 border border-red-900 rounded-full text-xs font-bold uppercase tracking-wider">
              <Trophy size={13} className="text-yellow-400" /> {lang === "bn" ? "রক্তদানের শপথ" : "LIFESAVER PLEDGE"}
            </span>
            <h2 className="text-3xl font-black tracking-tight leading-tight">
              {lang === "bn" 
                ? "মানবতার সেবায় বিশেষ শপথ গ্রহণ করুন" 
                : "Become a Verified Hero of Humanity"}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
              {lang === "bn"
                ? "৪টি ছোট্ট অঙ্গীকারে সম্মতি দিয়ে রক্তদাতার ভার্চুয়াল শপথপত্র আনলক করুন এবং সামাজিক সচেতনতা ছড়াতে মেডেল যুক্ত ডিজিটাল সার্টিফিকেটটি প্রকাশ করুন!"
                : "Make four core pledges to unlock your clinical digital shield of volunteerism. Download and share to motivate family, colleagues and active circles."}
            </p>

            <div className="space-y-3 pt-2" id="pledges-interactive-box">
              {[
                {
                  key: "regular",
                  bn: "সুযোগ পেলেই নিয়মিত নিরাপদ রক্তদান করে অন্যের সাহায্য করবো।",
                  en: "I will donate safe blood responsibly whenever my recovery period ends."
                },
                {
                  key: "healthy",
                  bn: "নিজের শরীর ও জীবনযাপন সর্বদা রোগমুক্ত এবং স্বাস্থ্যকর রাখবো।",
                  en: "I will maintain a healthy, toxin-free clinical physical lifestyle."
                },
                {
                  key: "emergency",
                  bn: "জরুরী ডাক ও রক্তের সংকটে সামর্থ্য অনুযায়ী সর্বদা সাড়া দেবো।",
                  en: "I vow to respond proactively and selflessly during critical disasters."
                },
                {
                  key: "awareness",
                  bn: "অন্যান্য ভাইবোনদের রক্তদানে উৎসাহিত করবো এবং কুসংস্কার দূর করবো।",
                  en: "I will educate circles, breaking safe-donation superstitions."
                }
              ].map((item) => (
                <label 
                  key={item.key} 
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                    (pledges as any)[item.key] 
                      ? "bg-red-500/10 border-red-500/60 text-white" 
                      : "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/70"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(pledges as any)[item.key]}
                    onChange={(e) => setPledges({ ...pledges, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-600 focus:ring-0 accent-red-600 text-red-600 mt-0.5"
                  />
                  <span className="text-xs md:text-sm font-semibold">{lang === "bn" ? item.bn : item.en}</span>
                </label>
              ))}
            </div>

            {allPledgesChecked && !showCertificate && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowCertificate(true)}
                className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/25 transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <FileBadge size={16} />
                {lang === "bn" ? "শপথের সার্টিফিকেট দেখুন 🎖️" : "Unlock Digital Certificate 🎖️"}
              </motion.button>
            )}
          </div>

          <div className="lg:col-span-1"></div>

          {/* Certificate output space */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <AnimatePresence mode="wait">
              {showCertificate && allPledgesChecked ? (
                <motion.div
                  initial={{ rotate: -3, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white text-slate-850 p-6 md:p-8 rounded-2xl w-full max-w-sm border-8 border-double border-yellow-500 relative shadow-2xl relative overflow-hidden"
                  id="digital-blood-pledge-badge"
                >
                  {/* Decorative gold badge background icon logo */}
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-yellow-100 rounded-full opacity-40"></div>

                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <span className="p-3 bg-yellow-50 rounded-full text-yellow-600 animate-spin-slow">
                        <Trophy size={36} />
                      </span>
                    </div>

                    <div className="space-y-1 text-center">
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest font-sans">
                        BLOODLIFE LEGACY CORES
                      </span>
                      <h4 className="text-xl font-black text-slate-900">
                        {lang === "bn" ? "সম্মানসূচক স্বীকৃতি" : "Certificate of Honor"}
                      </h4>
                      <div className="w-16 h-0.5 bg-yellow-500 mx-auto my-1"></div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {lang === "bn"
                        ? "রক্তদান জীবন প্ল্যাটফর্ম কৃতজ্ঞতার সাথে স্বীকৃতি প্রদান করছে যে, একজন মানবিক মানুষ হিসেবে আপনি সকল স্বেচ্ছাসেবী রক্তদানের আদর্শ এবং জীবন রক্ষার অঙ্গীকারে স্বাক্ষর করেছেন।"
                        : "This certifies that you have successfully made the pledge of life, dedicating your recovery cycle to the donation of clinical units and societal motivation."}
                    </p>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider">
                        STATUS VERIFIED BY CORES
                      </p>
                      <p className="text-xs font-black text-emerald-600 mt-1 flex items-center justify-center gap-1">
                        <ShieldCheck size={14} /> {lang === "bn" ? "অঙ্গীকারকারী রক্তদাতা সদস্য" : "ACTIVE HUMANITARIAN HERO"}
                      </p>
                    </div>

                    <p className="text-[9px] text-slate-400 font-sans italic text-center">
                      © 2026 BloodLife Bangladesh. Verified System Code 449A.
                    </p>

                    <button 
                      onClick={() => {
                        setPledges({ regular: false, healthy: false, emergency: false, awareness: false });
                        setShowCertificate(false);
                      }} 
                      className="text-slate-400 hover:text-red-500 text-[10px] font-bold underline transition-colors block mx-auto pt-2 cursor-pointer"
                    >
                      {lang === "bn" ? "রিসেট করুন ✕" : "Reset Pledge ✕"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center bg-slate-800/20 border border-dashed border-slate-700/60 rounded-2xl w-full max-w-sm space-y-3"
                >
                  <FileBadge className="mx-auto text-slate-600 h-12 w-12 animate-pulse" />
                  <p className="text-sm text-slate-400 font-semibold">
                    {lang === "bn" 
                      ? "বামদিকের অঙ্গীকারগুলো সম্পন্ন করে আপনার বিশেষ সম্মানসূচক সার্টিফিকেটটি আনলক করুন!" 
                      : "Complete all four promises on the left to reveal your active certificate on-screen!"}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. Styled Compatibility Chart (Extremely clinical and professional) */}
      <section className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-xs space-y-6" id="compatibility-matrix-section">
        <div className="space-y-1 block max-w-md">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-6 bg-[#D32F2F] rounded-full inline-block"></span>
            {lang === "bn" ? "রক্তের গ্রুপ সামঞ্জস্যতা নির্দেশিকা" : "Clinical Compatibility Guidelines"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {lang === "bn"
              ? "অন্যকে রক্ত দেওয়ার ক্ষেত্রে এবং অপরের থেকে রক্ত গ্রহণের সামঞ্জস্যপূর্ণ রক্তের গ্রুপের তালিকা।"
              : "Comprehensive reference matrix charting active donors and matched recipient categories safely."}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-100" id="compatibility-table-wrapper">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-gray-100 font-sans uppercase text-[10px] tracking-wider">
                <th className="py-3 px-5">{translations.bloodGroup}</th>
                <th className="py-3 px-5">{lang === "bn" ? "যাদের রক্ত দিতে পারবেন (Give To)" : "Who Can Accept From You"}</th>
                <th className="py-3 px-5">{lang === "bn" ? "যাদের থেকে রক্ত নিতে পারবেন (Receive From)" : "Who You Can Safely Receive From"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPATIBILITY_CHART.map((row) => (
                <tr key={row.group} className="hover:bg-red-50/10 transition-colors">
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-[#D32F2F] text-xs font-black ring-1 ring-red-200">
                      {row.group}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-slate-800 font-sans text-xs">
                    {row.giveTo}
                  </td>
                  <td className="py-4 px-5 text-gray-600 font-sans text-xs">
                    {row.receiveFrom}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Dedicated Safe Blood Donation Visual Spotlight & Health Directives */}
      <section className="bg-white p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="safe-donation-spotlight-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lottie Animation Pure-White Seamless Container */}
          <div className="lg:col-span-5 flex justify-center items-center bg-white rounded-2xl p-2 sm:p-4">
            <div className="w-full max-w-sm h-64 sm:h-80 relative flex items-center justify-center bg-white">
              <iframe
                src="https://lottie.host/embed/c39f33a3-e0b4-4c3a-a8d1-ac6693ac31dc/EswJFUAK8w.lottie"
                title="Blood Donation Lifesaver Animation"
                className="w-full h-full border-0 pointer-events-none bg-transparent"
                // @ts-ignore
                allowtransparency="true"
                style={{ background: "transparent" }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Right Text & Guidelines */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold font-sans border border-red-100">
                ❤️ {lang === "bn" ? "নিরাপদ রক্তদান গাইড" : "Safe Transfusion Protocol"}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                {lang === "bn"
                  ? "রক্তদানের সহজ প্রস্তুতি ও সচেতনতামূলক নির্দেশনা"
                  : "Essential Directives & Safe Blood Donation Protocol"}
              </h2>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                {lang === "bn"
                  ? "আপনার সামান্য রক্তদান অন্য একটি পরিবারে ফিরিয়ে দিতে পারে নতুন আশার আলো। নিরাপদ রক্তদানের প্রতিটি নিয়ম মেনে চলুন এবং সুস্থ থাকুন।"
                  : "A single bag of donated blood can save up to three lives. Follow standard clinical protocols before and after donation."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-red-100 transition-colors">
                <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                  <span>🥤</span> {lang === "bn" ? "পর্যাপ্ত বিশ্রাম ও জলপান" : "Rest & Hydration"}
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {lang === "bn"
                    ? "রক্তদানের পূর্ববর্তী রাতে অন্তত ৭-৮ ঘণ্টা গভীর ঘুম নিশ্চিত করুন এবং প্রচুর তরল পানীয় পান করুন।"
                    : "Obtain 7-8 hours of sleep the night prior and stay well-hydrated throughout the day."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 hover:border-emerald-100 transition-colors">
                <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-2">
                  <span>🥗</span> {lang === "bn" ? "পুষ্টিকর খাবার গ্রহণ" : "Nutritious Meals"}
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {lang === "bn"
                    ? "খালি পেটে রক্ত দেবেন না। দান করার ৩-৪ ঘণ্টা পূর্বে পুষ্টিকর খাবার ও প্রোটিনসমৃদ্ধ খাদ্য গ্রহণ করুন।"
                    : "Never donate on an empty stomach. Consume a light, nutrient-rich meal 3 hours in advance."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Elegant FAQ / Eligibility Check requirements list */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8" id="faq-requirements-section">
        {/* Column 1: Eligibility criteria */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span> {lang === "bn" ? "রক্ত দানের প্রাথমিক যোগ্যতা" : "Primary Criteria of Candidates"}
          </h3>
          <ul className="space-y-3">
            {[
              {
                bn: "বয়সসীমা অবশ্যই ১৮ থেকে ৬০ বছরের মাঝে হতে হবে।",
                en: "Must fall between the age threshold of 18 and 60 years.",
              },
              {
                bn: "ওজন কমপক্ষে ৪৫ কেজি (অথবা রক্তদান কেন্দ্রের নিয়ম অনুযায়ী) হতে হবে।",
                en: "Must maintain a body weight of at least 45 kilograms.",
              },
              {
                bn: "শেষ রক্তদানের পর অন্তত ১২০ দিন (৪ মাস) অতিবাহিত হতে হবে।",
                en: "A mandatory recovery gap of 120 days must elapse between donations.",
              },
              {
                bn: "রক্তচাপ, দেহের তাপমাত্রা ও হিমোগ্লোবিন স্বাভাবিক মাত্রায় থাকতে হবে।",
                en: "Your blood pressure, core temperature and hemoglobin levels must be clinical.",
              },
              {
                bn: "কোনো জটিল সংক্রামক বা রক্তবাহিত রোগে আক্রান্ত থাকা যাবে না।",
                en: "Should not suffer from active bloodborne or chronic clinical diseases.",
              },
            ].map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-xs text-gray-600 leading-relaxed font-semibold">
                <CheckCircle2 size={16} className="text-[#D32F2F] shrink-0 mt-0.5" />
                <span>{lang === "bn" ? item.bn : item.en}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2: Preparation directives */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span>🥤</span> {lang === "bn" ? "রক্ত দানের পূর্বের প্রস্তুতি" : "Directives Prior to Donating"}
          </h3>
          <ul className="space-y-3">
            {[
              {
                bn: "রক্ত দানের আগের রাতে পর্যাপ্ত পরিমাণ (অন্তত ৭-৮ ঘণ্টা) ঘুমান।",
                en: "Obtain a restorative deep night sleep of 7-8 hours prior to scheduling.",
              },
              {
                bn: "দান করার ৩-৪ ঘণ্টা পূর্বে পুষ্টিকর খাবার গ্রহণ করুন, খালি পেটে থাকবেন না।",
                en: "Consume a nutritious, low-fat meal 3-4 hours prior; do not donate on empty stomach.",
              },
              {
                bn: "রক্ত দানের আগের ও পরের কয়েক ঘন্টা প্রচুর পানি বা তরল পানীয় পান করুন।",
                en: "Consume generous amounts of clean water and hydration drinks before reporting.",
              },
              {
                bn: "রক্ত দেওয়ার পূর্ববর্তী ২৪ ঘণ্টায় কোনো ধূমপান বা কোল্ড ড্রিঙ্কস পরিহার করুন।",
                en: "Avoid cold beverages or caffeinated stimulants in the preceding 24 hours.",
              },
              {
                bn: "পরবর্তী সময়ে কমপক্ষে ১৫-৩০ মিনিট কেন্দ্রে বিশ্রাম নিন ও হালকা নাস্তা করুন।",
                en: "Rest peacefully for 15-30 minutes post session and opt for juices provided.",
              },
            ].map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-xs text-gray-600 leading-relaxed font-semibold">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{lang === "bn" ? item.bn : item.en}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
