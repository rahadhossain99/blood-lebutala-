import React from "react";
import { Droplet, LogIn, LogOut, Globe, User, ShieldAlert } from "lucide-react";

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
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs" id="navbar-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Brand Header */}
          <div
            onClick={() => setCurrentTab("home")}
            className="flex items-center gap-2 cursor-pointer select-none group"
            id="brand-logo"
          >
            <div className="p-1 px-1.5 bg-red-50 group-hover:bg-red-100 rounded-xl transition-colors duration-200">
              <Droplet className="text-[#D32F2F] fill-[#D32F2F] h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-[#D32F2F] transition-colors">
                {translations.appName}
              </span>
              <p className="text-[9px] text-[#D32F2F] font-bold tracking-widest uppercase -mt-0.5 leading-none">
                {lang === "bn" ? "রক্তদান প্ল্যাটফর্ম" : "Blood Network"}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Link Toggles */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "home", label: translations.home },
              { id: "search", label: translations.findDonor },
              { id: "stats", label: translations.dashboard },
              { id: "appointments", label: translations.appointments },
            ].map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "text-[#D32F2F] bg-red-50/70"
                      : "text-gray-600 hover:text-[#D32F2F] hover:bg-gray-50/60"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Dynamic Actions Ribbon */}
          <div className="flex items-center gap-3">
            {/* Quick Language Toggle Button */}
            <button
              onClick={() => setLang(lang === "bn" ? "en" : "bn")}
              className="p-2 text-gray-500 hover:text-[#D32F2F] hover:bg-gray-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer font-semibold text-xs border border-gray-100"
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
                      <ShieldAlert size={12} className="text-[#D32F2F]" title="System Admin" />
                    )}
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#D32F2F] font-bold bg-red-50 px-1.5 py-0.5 rounded-full mt-1">
                    {translations.bloodGroup}: {currentUser.bloodGroup}
                  </span>
                </div>

                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-red-100 shadow-xs shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-8 w-8 bg-gradient-to-tr from-[#D32F2F] to-[#E53935] text-white rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-red-100 select-none shrink-0">
                    {currentUser.name.substring(0, 1)}
                  </div>
                )}

                {/* Log Out option */}
                <button
                  onClick={onLogout}
                  id="logout-action-btn"
                  className="p-2 text-gray-500 hover:text-[#D32F2F] hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  title={translations.logout}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                id="login-trigger-btn"
                className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs md:text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn size={15} />
                <span>{translations.login}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Tab Navigation Footer bar (Excellent responsive fallback design) */}
      <div className="md:hidden flex justify-around items-center bg-white border-t border-gray-100 h-14" id="mobile-tab-nav">
        {[
          { id: "home", label: translations.home },
          { id: "search", label: translations.findDonor },
          { id: "stats", label: translations.dashboard },
          { id: "appointments", label: translations.appointments },
        ].map((link) => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`flex-1 text-center py-2 text-[11px] font-bold flex flex-col items-center justify-center ${
                isActive ? "text-[#D32F2F] bg-red-50/20" : "text-gray-500"
              }`}
            >
              <span>{link.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
