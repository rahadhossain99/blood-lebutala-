import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Mail, Phone, Lock, User, MapPin, Calendar, Heart, Loader2 } from "lucide-react";
import { BloodGroup } from "../types";
import { BANGLADESH_DISTRICTS } from "../utils";
import { apiClient } from "../apiClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "bn" | "en";
  translations: any;
  onAuthSuccess: (token: string, user: any) => void;
}

export default function AuthModal({ isOpen, onClose, lang, translations, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("A+");
  const [district, setDistrict] = useState(BANGLADESH_DISTRICTS[0]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [avatarBase64, setAvatarBase64] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  // Trigger Google Login popup
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    try {
      const data = await apiClient.getGoogleAuthUrl();
      
      const authWindow = window.open(data.url, "google_oauth_popup", "width=500,height=680");
      if (!authWindow) {
        setErrorMsg(lang === "bn" ? "পপ-আপ বন্ধ করা আছে। অনুগ্রহ করে ব্রাউজার পপ-আপ অনুমোদন করুন।" : "Popup is blocked. Please enable browser popups.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "গুগল লগইন ব্যর্থ হয়েছে!");
    }
  };

  // Listen for Google Auth Success messaging
  React.useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Accept matching domains, github.io and development local hosts
      if (
        !origin.endsWith('.run.app') &&
        !origin.includes('localhost') &&
        !origin.includes('netlify.app') &&
        !origin.includes('github.io')
      ) {
         return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
         onAuthSuccess(event.data.token, event.data.user);
         onClose();
      }
    };
    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [onAuthSuccess, onClose]);

  // Image upload base64 selector
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(lang === "bn" ? "ছবির সাইজ সর্বাধিক ২ মেগাবাইট হতে পারবে।" : "Maximum image file size is 2MB.");
      return;
    }

    setUploadingImg(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarBase64(reader.result as string);
      setUploadingImg(false);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body: Record<string, any> = {};

    if (mode === "login") {
      body.credential = email || phone;
      body.password = password;
    } else {
      body.name = name;
      body.email = email;
      body.phone = phone;
      body.password = password;
      body.bloodGroup = bloodGroup;
      body.district = district;
      body.isAvailable = isAvailable;
      body.lastDonationDate = lastDonationDate || "";
      if (avatarBase64) {
         body.avatarUrl = avatarBase64;
      }
    }

    try {
      let data: { token: string; user: any };
      if (mode === "login") {
        data = await apiClient.login(email || phone, password);
      } else {
        data = await apiClient.register(body);
      }

      // Success
      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || translations.errorAction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        id="auth-modal-container"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100"
      >
        {/* Custom Header with Red blood-theme accent */}
        <div className="bg-gradient-to-r from-[#D32F2F] to-[#E53935] px-6 py-5 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold tracking-tight">
              {mode === "login" ? translations.login : translations.register}
            </h3>
            <p className="text-xs text-red-50/80 mt-1 font-sans">
              {translations.appSubTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            id="auth-modal-close-btn"
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} id="auth-form" className="p-6 md:p-8 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div id="auth-error-alert" className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm font-sans flex items-center gap-2">
              <span className="font-semibold">⚠️</span> {errorMsg}
            </div>
          )}

          {/* REGISTER EXTRA FIELDS */}
          {mode === "register" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
              id="register-fields-group"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.name} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === "bn" ? "যেমন: মোহাম্মদ রহিম" : "e.g. Mohammad Rahim"}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Blood Group and District side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.bloodGroup} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Heart className="absolute left-3 top-2.5 h-4 w-4 text-[#D32F2F]" />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm bg-white"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.district} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm bg-white"
                    >
                      {BANGLADESH_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Phone for verification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.phone} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Last Donation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.lastDonation} <span className="text-gray-400 text-xs">({lang === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    value={lastDonationDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {translations.eligibilityNotice}
                </p>
              </div>

              {/* Is Available Immediate Toggle */}
              <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-lg border border-red-100/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-800">
                    {translations.isAvailableToggle}
                  </p>
                  <p className="text-xs text-gray-500">
                    {lang === "bn" ? "প্রস্তুত থাকলে মানুষ আপনাকে সহজে খুঁজতে পারবে" : "Turn on to show in instant search"}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Profile photo upload with dynamic localized base64 converter and preview bubble */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  {lang === "bn" ? "নিজের ছবি যুক্ত করুন" : "Personal Portrait / Photo"} <span className="text-gray-400 text-xs">({lang === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
                </label>
                <div className="flex items-center gap-4 p-3 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
                  {avatarBase64 ? (
                    <img src={avatarBase64} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shrink-0 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 font-sans flex items-center justify-center text-lg font-bold border border-red-200 shrink-0">
                      📸
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="profile-avatar-uploader"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-avatar-uploader"
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-xs cursor-pointer inline-block"
                    >
                      {uploadingImg ? (lang === "bn" ? "লোডিং..." : "Uploading...") : (lang === "bn" ? "ফাইল নির্বাচন করুন" : "Choose File")}
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1 leading-none">
                      {lang === "bn" ? "জেপিজি, পিএনজি (সর্বোচ্চ ২ এমবি)" : "JPEG, PNG format (Max 2MB)"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Email / Credential (Matches login with phone/email too) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === "login" ? (lang === "bn" ? "মোবাইল নাম্বার অথবা ইমেল" : "Phone or Email Address") : translations.email} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {mode === "login" ? (
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              ) : (
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              )}
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "login" ? (lang === "bn" ? "যেমন: exam@mail.com বা ফোন নাম্বার" : "e.g. donor@mail.com or phone") : "e.g. donor@gmail.com"}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {translations.password} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            id="auth-submit-btn"
            className="w-full py-2.5 bg-gradient-to-r from-[#D32F2F] to-[#E53935] text-white font-medium rounded-lg text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                {lang === "bn" ? "প্রসেসিং হচ্ছে..." : "Processing..."}
              </>
            ) : mode === "login" ? (
              translations.loginButton
            ) : (
              translations.registerButton
            )}
          </button>

          {/* Premium Google OAuth / Simulator Sign In Trigger */}
          <div className="relative my-5 flex items-center justify-center">
            <span className="absolute px-3 bg-white text-xs font-bold text-slate-400 tracking-wider">
              {lang === "bn" ? "অথবা" : "OR"}
            </span>
            <div className="border-t border-slate-100 w-full"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:border-slate-300"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span className="font-sans text-slate-800 font-bold text-sm tracking-tight">
              {lang === "bn" ? "গুগল একাউন্ট দিয়ে সাইন-ইন" : "Sign in with Google"}
            </span>
          </button>

          {/* Switch Mode Toggle */}
          <div className="pt-3 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMsg("");
              }}
              id="auth-mode-toggle-btn"
              className="text-sm text-[#D32F2F] hover:underline focus:outline-hidden"
            >
              {mode === "login" ? translations.noAccount : translations.hasAccount}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
