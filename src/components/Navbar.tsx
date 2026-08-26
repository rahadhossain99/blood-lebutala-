import React from "react";
import { 
  Home, Search, Calendar, BarChart3, BookOpen, 
  LogIn, LogOut, Globe, ShieldAlert, User, Sparkles
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  lang: "bn" | "en";
  setLang: (lang: "bn" | "en") => void;
  translations: any;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenProfile,
  lang,
  setLang,
  translations,
}: NavbarProps) {
  const navItems = [
    { id: "home", label: translations.home, icon: Home },
    { id: "search", label: translations.findDonor, icon: Search },
    { id: "appointments", label: translations.appointments, icon: Calendar },
    { id: "stats", label: translations.dashboard, icon: BarChart3 },
    { id: "guidelines", label: translations.guidelines, icon: BookOpen },
  ];

  const isProfileIncomplete = currentUser && (!currentUser.phone || currentUser.phone.length < 11);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs" id="navbar-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand Header */}
          <div
            onClick={() => setCurrentTab("home")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="h-10 w-10 rounded-xl overflow-hidden shadow-xs ring-2 ring-rose-100 group-hover:scale-105 transition-transform flex items-center justify-center bg-rose-50">
              <img 
                src="./icon.svg" 
                alt="BloodLife Logo" 
                className="h-full w-full object-contain"
                onError={(e) => {
                  // Fallback if svg fails to load
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-gray-900 group-hover:text-rose-600 transition-colors">
                {translations.appName}
              </span>
              <p className="text-[9px] text-rose-600 font-extrabold tracking-wider uppercase -mt-0.5 leading-none">
                {lang === "bn" ? "লেবুতলা রক্তদান নেটওয়ার্ক" : "Lebutala Blood Network"}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Link Toggles */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((link) => {
              const isActive = currentTab === link.id;
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "text-rose-600 bg-rose-50"
                      : "text-gray-600 hover:text-rose-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={15} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Dynamic Actions Ribbon */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Language Toggle Button */}
            <button
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              className="p-2 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer font-semibold text-xs border border-gray-200"
              id="lang-toggle-button"
              title={lang === "bn" ? "Translate to English" : "বাংলায় অনুবাদ করুন"}
            >
              <Globe size={15} />
              <span>{lang === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            {/* User Session Indicators */}
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3" id="user-metadata-section">
                {/* Profile Edit button with incomplete badge */}
                <button
                  onClick={onOpenProfile}
                  id="navbar-profile-btn"
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-gray-800 transition-all cursor-pointer relative"
                  title={lang === "bn" ? "প্রোফাইল সম্পাদন করুন" : "Edit Profile"}
                >
                  {isProfileIncomplete && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                    </span>
                  )}
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-rose-200 shadow-xs shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-7 w-7 bg-gradient-to-tr from-rose-600 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-rose-100 select-none shrink-0">
                      {currentUser.name?.substring(0, 1) || "U"}
                    </div>
                  )}

                  <div className="hidden md:flex flex-col items-start text-left">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1 leading-none">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-rose-700 font-bold mt-0.5 flex items-center gap-0.5">
                      {currentUser.bloodGroup} • {isProfileIncomplete ? (lang === "bn" ? "অসম্পূর্ণ" : "Incomplete") : (lang === "bn" ? "প্রোফাইল" : "Profile")}
                    </span>
                  </div>
                </button>

                {/* Log Out option */}
                <button
                  onClick={onLogout}
                  id="logout-action-btn"
                  className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  title={translations.logout}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                id="login-trigger-btn"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs md:text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={15} />
                <span>{translations.login}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Tab Navigation Footer bar (Native App Look & Feel) */}
      <div className="lg:hidden flex justify-around items-center bg-white border-t border-gray-200 h-14" id="mobile-tab-nav">
        {navItems.map((link) => {
          const isActive = currentTab === link.id;
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`flex-1 text-center py-1.5 text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                isActive ? "text-rose-600 font-extrabold" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={16} className={isActive ? "text-rose-600 stroke-[2.5]" : "text-gray-400"} />
              <span className="truncate max-w-[65px]">{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
