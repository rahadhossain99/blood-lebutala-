import React, { useState, useEffect } from "react";
import { TRANSLATIONS, getApiUrl } from "./utils";
import { User, Appointment, DashboardStats } from "./types";
import Navbar from "./components/Navbar";
import HomeHero from "./components/HomeHero";
import DonorsSearch from "./components/DonorsSearch";
import StatsDashboard from "./components/StatsDashboard";
import AppointmentsSection from "./components/AppointmentsSection";
import AuthModal from "./components/AuthModal";
import { AlertCircle, CheckCircle2, Heart, Info } from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [currentTab, setCurrentTab] = useState<string>("home");
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
      const resp = await fetch(getApiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setCurrentUser(data.user);
      } else {
        localStorage.removeItem("blood_donation_token");
      }
    } catch (err) {
      console.error("Session verification failed", err);
    }
  };

  // Fetch real-time blood bank metrics
  const fetchDashboardStats = async () => {
    try {
      const resp = await fetch(getApiUrl("/api/stats"));
      if (resp.ok) {
        const data = await resp.json();
        setStats({
          totalDonors: data.totalDonors,
          availableDonors: data.availableDonors,
          totalDonations: data.totalDonations,
          bloodStock: data.bloodStock,
          recentBookings: data.recentAppointments
        });
      }
    } catch (err) {
      console.error("Failed to load statistics", err);
    }
  };

  useEffect(() => {
    // Check if coming back from standard dynamic callback redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("oauth_success") === "true") {
      // Clear URL query params elegantly
      window.history.replaceState({}, document.title, window.location.pathname);
      showToast(
        lang === "bn" 
          ? "গুগল অথেনটিকেশন সফল হয়েছে!" 
          : "Google login authenticated successfully!",
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
    // Switch to landing page
    setCurrentTab("home");
  };

  // Update administrative appointment status (Pending, Approved, Completed, Cancelled)
  const handleUpdateApptStatus = async (id: string, nextStatus: Appointment["status"]) => {
    const token = localStorage.getItem("blood_donation_token");
    if (!token) return;

    try {
      const resp = await fetch(getApiUrl(`/api/appointments/${id}/status`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      if (resp.ok) {
        showToast(
          lang === "bn" ? "অ্যাপয়েন্টমেন্ট অবস্থা সফলভাবে পরিবর্তন করা হয়েছে।" : "Appointment status changed successfully.",
          "success"
        );
        fetchDashboardStats();
      } else {
        showToast(translations.errorAction, "error");
      }
    } catch {
      showToast(translations.errorAction, "error");
    }
  };

  // Trigger quick direct booking from the donor query screen
  const handleTriggerBooking = (donor: User) => {
    setPreSelectedDonor(donor);
    setCurrentTab("appointments");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between" id="bloodlife-root-container">
      {/* 1. Interactive Header Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        lang={lang}
        setLang={setLang}
        translations={translations}
      />

      {/* 2. Custom Animated Micro Toast alert */}
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

      {/* 3. Main Dashboard Routing Core */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentTab === "home" && (
          <HomeHero
            setCurrentTab={setCurrentTab}
            onOpenAuth={() => setAuthModalOpen(true)}
            lang={lang}
            translations={translations}
          />
        )}

        {currentTab === "search" && (
          <DonorsSearch
            currentUser={currentUser}
            lang={lang}
            translations={translations}
            onOpenAuth={() => setAuthModalOpen(true)}
            onTriggerBooking={handleTriggerBooking}
          />
        )}

        {currentTab === "stats" && (
          <StatsDashboard
            stats={stats}
            currentUser={currentUser}
            lang={lang}
            translations={translations}
            onRefreshStats={fetchDashboardStats}
            onUpdateApptStatus={handleUpdateApptStatus}
            onUpdateUser={setCurrentUser}
          />
        )}

        {currentTab === "appointments" && (
          <AppointmentsSection
            currentUser={currentUser}
            preSelectedDonor={preSelectedDonor}
            onClearPreSelectedDonor={() => setPreSelectedDonor(null)}
            lang={lang}
            translations={translations}
            onRefreshStats={fetchDashboardStats}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* 4. Elegant Minimal Page Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-16 border-t border-slate-800" id="bloodlife-page-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-white font-bold tracking-tight text-base flex items-center justify-center sm:justify-start gap-1.5 leading-none select-none">
              <span className="p-1 bg-red-600 rounded-lg text-white font-sans shrink-0">🩸</span>
              {translations.appName}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {translations.appSubTitle}
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button onClick={() => setCurrentTab("home")} className="hover:text-white transition-colors cursor-pointer">{translations.home}</button>
            <span>•</span>
            <button onClick={() => setCurrentTab("search")} className="hover:text-white transition-colors cursor-pointer">{translations.findDonor}</button>
            <span>•</span>
            <button onClick={() => setCurrentTab("stats")} className="hover:text-white transition-colors cursor-pointer">{translations.dashboard}</button>
            <span>•</span>
            <button onClick={() => setCurrentTab("appointments")} className="hover:text-white transition-colors cursor-pointer font-sans">{lang === "bn" ? "বুকিং" : "Schedules"}</button>
          </div>
          
          <p className="text-[10px] text-slate-600 font-sans tracking-wide">
            © 2026 BloodLife. {lang === "bn" ? "সকল অধিকার সংরক্ষিত।" : "All Rights Reserved."}
          </p>
        </div>
      </footer>

      {/* 5. Dynamic Auth Modal Wrapper */}
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
