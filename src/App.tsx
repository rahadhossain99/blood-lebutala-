import React, { useState, useEffect } from "react";
import { TRANSLATIONS } from "./utils";
import { apiClient } from "./apiClient";
import { User, Appointment, DashboardStats } from "./types";
import Navbar from "./components/Navbar";
import HomeHero from "./components/HomeHero";
import DonorsSearch from "./components/DonorsSearch";
import StatsDashboard from "./components/StatsDashboard";
import AppointmentsSection from "./components/AppointmentsSection";
import GuidelinesSection from "./components/GuidelinesSection";
import PWAInstallBanner from "./components/PWAInstallBanner";
import AuthModal from "./components/AuthModal";
import { AlertCircle, CheckCircle2, Heart, Info, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const hash = window.location.hash.replace("#", "");
    return ["home", "search", "stats", "appointments", "guidelines"].includes(hash) ? hash : "home";
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preSelectedDonor, setPreSelectedDonor] = useState<User | null>(null);

  // Toast notifications state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Stats dynamic dashboard parameters
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    availableDonors: 0,
    totalDonations: 0,
    bloodStock: {
      "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
    },
    recentBookings: []
  });

  const translations = TRANSLATIONS[lang];

  // Hash-based page navigation synchronization
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (["home", "search", "stats", "appointments", "guidelines"].includes(hash)) {
        setCurrentTab(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Global dynamic toast trigger helper
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Restore token session on mount
  const restoreUserSession = async () => {
    const token = localStorage.getItem("blood_donation_token");
    if (!token) return;

    try {
      const data = await apiClient.getMe(token);
      setCurrentUser(data.user);
    } catch (err) {
      console.error("Session verification failed", err);
      localStorage.removeItem("blood_donation_token");
    }
  };

  // Fetch real-time blood bank metrics
  const fetchDashboardStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats({
        totalDonors: data.totalDonors,
        availableDonors: data.availableDonors,
        totalDonations: data.totalDonations,
        bloodStock: data.bloodStock,
        recentBookings: data.recentAppointments || []
      });
    } catch (err) {
      console.error("Failed to load statistics", err);
    }
  };

  useEffect(() => {
    // Check if coming back from standard dynamic callback redirect or Google OAuth param
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("blood_donation_token", tokenFromUrl);
    }

    if (urlParams.get("oauth_success") === "true" || tokenFromUrl) {
      // Clear URL query params elegantly while keeping hash
      const cleanUrl = window.location.pathname + (window.location.hash || "");
      window.history.replaceState({}, document.title, cleanUrl);
      showToast(
        lang === "bn" 
          ? "গুগল সাইন-ইন সফল হয়েছে! স্বাগতম।" 
          : "Google sign-in authenticated successfully!",
        "success"
      );
    }
    restoreUserSession();
    fetchDashboardStats();
  }, [lang]);

  // Set successfully loaded authenticated user context
  const handleAuthSuccess = (token: string, user: any) => {
    localStorage.setItem("blood_donation_token", token);
    setCurrentUser(user);
    showToast(
      lang === "bn"
        ? `স্বাগতম ${user.name}! আপনি সফলভাবে লগইন করেছেন।`
        : `Welcome ${user.name}! Sign in successful.`,
      "success"
    );
    fetchDashboardStats();
  };

  // Clear session token to log out
  const handleLogout = () => {
    localStorage.removeItem("blood_donation_token");
    setCurrentUser(null);
    showToast(
      lang === "bn" ? "সফলভাবে লগ-আউট সম্পন্ন হয়েছে।" : "You have logged out successfully.",
      "info"
    );
    handleTabChange("home");
  };

  // Update administrative appointment status (Pending, Approved, Completed, Cancelled)
  const handleUpdateApptStatus = async (id: string, nextStatus: Appointment["status"]) => {
    const token = localStorage.getItem("blood_donation_token");
    if (!token) return;

    try {
      await apiClient.updateAppointmentStatus(id, nextStatus, token);
      showToast(
        lang === "bn" ? "অ্যাপয়েন্টমেন্ট অবস্থা সফলভাবে পরিবর্তন করা হয়েছে।" : "Appointment status changed successfully.",
        "success"
      );
      fetchDashboardStats();
    } catch {
      showToast(translations.errorAction, "error");
    }
  };

  // Trigger quick direct booking from the donor query screen
  const handleTriggerBooking = (donor: User) => {
    setPreSelectedDonor(donor);
    handleTabChange("appointments");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="bloodlife-root-container">
      {/* 1. Interactive Header Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        lang={lang}
        setLang={setLang}
        translations={translations}
      />

      {/* 2. PWA Install Prompt Banner */}
      <PWAInstallBanner lang={lang} />

      {/* 3. Custom Animated Micro Toast alert */}
      {toast && (
        <div
          id="global-toast-message"
          className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border transition-all duration-300 transform translate-y-0 text-sm max-w-sm font-sans ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="text-emerald-500 shrink-0" size={18} />}
          {toast.type === "error" && <AlertCircle className="text-rose-500 shrink-0" size={18} />}
          {toast.type === "info" && <Info className="text-blue-500 shrink-0" size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 4. Main Tab Pages Routing Core */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <AnimatePresence mode="wait">
          {currentTab === "home" && (
            <motion.div
              key="page-home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <HomeHero
                setCurrentTab={handleTabChange}
                onOpenAuth={() => setAuthModalOpen(true)}
                lang={lang}
                translations={translations}
              />
            </motion.div>
          )}

          {currentTab === "search" && (
            <motion.div
              key="page-search"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DonorsSearch
                currentUser={currentUser}
                lang={lang}
                translations={translations}
                onOpenAuth={() => setAuthModalOpen(true)}
                onTriggerBooking={handleTriggerBooking}
              />
            </motion.div>
          )}

          {currentTab === "stats" && (
            <motion.div
              key="page-stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <StatsDashboard
                stats={stats}
                currentUser={currentUser}
                lang={lang}
                translations={translations}
                onRefreshStats={fetchDashboardStats}
                onUpdateApptStatus={handleUpdateApptStatus}
                onUpdateUser={setCurrentUser}
              />
            </motion.div>
          )}

          {currentTab === "appointments" && (
            <motion.div
              key="page-appointments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AppointmentsSection
                currentUser={currentUser}
                preSelectedDonor={preSelectedDonor}
                onClearPreSelectedDonor={() => setPreSelectedDonor(null)}
                lang={lang}
                translations={translations}
                onRefreshStats={fetchDashboardStats}
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            </motion.div>
          )}

          {currentTab === "guidelines" && (
            <motion.div
              key="page-guidelines"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <GuidelinesSection
                lang={lang}
                translations={translations}
                onNavigateToSearch={() => handleTabChange("search")}
                onNavigateToRequest={() => handleTabChange("appointments")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 5. Elegant Minimal Page Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-16 border-t border-slate-800" id="bloodlife-page-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-white font-black tracking-tight text-base flex items-center justify-center sm:justify-start gap-2 leading-none select-none">
              <img src="./icon.svg" alt="App Icon" className="h-6 w-6 rounded-md" />
              {translations.appName}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {translations.appSubTitle}
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs font-semibold">
            <button onClick={() => handleTabChange("home")} className="hover:text-white transition-colors cursor-pointer">{translations.home}</button>
            <span>•</span>
            <button onClick={() => handleTabChange("search")} className="hover:text-white transition-colors cursor-pointer">{translations.findDonor}</button>
            <span>•</span>
            <button onClick={() => handleTabChange("appointments")} className="hover:text-white transition-colors cursor-pointer">{translations.appointments}</button>
            <span>•</span>
            <button onClick={() => handleTabChange("stats")} className="hover:text-white transition-colors cursor-pointer">{translations.dashboard}</button>
            <span>•</span>
            <button onClick={() => handleTabChange("guidelines")} className="hover:text-white transition-colors cursor-pointer">{translations.guidelines}</button>
          </div>
          
          <p className="text-[10px] text-slate-500 font-sans tracking-wide">
            © 2026 BloodLife. {lang === "bn" ? "সকল অধিকার সংরক্ষিত।" : "All Rights Reserved."}
          </p>
        </div>
      </footer>

      {/* 6. Dynamic Auth Modal Wrapper */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        lang={lang}
        translations={translations}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
