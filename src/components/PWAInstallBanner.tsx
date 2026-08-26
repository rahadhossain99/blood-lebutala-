import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PWAInstallBannerProps {
  lang: "bn" | "en";
}

export default function PWAInstallBanner({ lang }: PWAInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        lang === "bn"
          ? "অ্যাপ ইনস্টল করতে আপনার ব্রাউজারের থ্রি-ডট (⋮) মেনুতে ক্লিক করে 'Add to Home screen' বা 'Install App' চাপুন।"
          : "To install, tap the browser menu (⋮) and select 'Add to Home screen' or 'Install App'."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md border-b border-rose-700 relative z-30"
          id="pwa-install-banner"
        >
          <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-bold leading-tight">
                  {lang === "bn" ? "BloodLife অ্যাপটি আপনার ফোনে ইনস্টল করুন!" : "Install BloodLife App on your device!"}
                </p>
                <p className="text-[11px] text-rose-100 hidden sm:block">
                  {lang === "bn" ? "দ্রুত এক ক্লিকে যেকোনো সময় রক্তদাতা খুঁজতে পারবেন।" : "Instant one-tap access anytime to find donors."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-white text-rose-700 font-bold rounded-lg hover:bg-rose-50 transition-colors shadow-xs flex items-center gap-1 cursor-pointer text-xs"
                id="install-pwa-btn"
              >
                <Download size={13} />
                <span>{lang === "bn" ? "অ্যাপ ইনস্টল করুন" : "Install App"}</span>
              </button>
              <button
                onClick={() => setShowBanner(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
