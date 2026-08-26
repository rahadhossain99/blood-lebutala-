import React from "react";
import { 
  Home, Search, Calendar, BarChart3, BookOpen, 
  LogIn, LogOut, Globe, ShieldAlert 
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: any;
  onLogout: () => void;
  onOpenAuth: () => void;
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
          <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-3" id="user-metadata-section">
                {/* Visual Avatar detail */}
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1 leading-none">
                    {currentUser.role === "admin" && (
                      <ShieldAlert size={12} className="text-rose-600" title="System Admin" />
                    )}
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-full mt-1">
                    {translations.bloodGroup}: {currentUser.bloodGroup}
                  </span>
                </div>

                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-rose-100 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-tr from-rose-600 to-red-600 text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-rose-100 select-none shrink-0">
                    {currentUser.name?.substring(0, 1) || "U"}
                  </div>
                )}

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
