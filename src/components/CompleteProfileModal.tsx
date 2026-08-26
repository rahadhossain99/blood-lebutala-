import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, User, Phone, MapPin, Calendar, Heart, ShieldCheck, 
  Camera, CheckCircle2, AlertCircle, Sparkles, Loader2, Info, Droplets
} from "lucide-react";
import { BloodGroup } from "../types";
import { BANGLADESH_DISTRICTS, checkDonorEligibility } from "../utils";
import { apiClient } from "../apiClient";

interface CompleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  lang: "bn" | "en";
  translations: any;
  onProfileUpdated: (updatedUser: any) => void;
}

const BLOOD_GROUPS: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function CompleteProfileModal({
  isOpen,
  onClose,
  currentUser,
  lang,
  translations,
  onProfileUpdated,
}: CompleteProfileModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("A+");
  const [district, setDistrict] = useState(BANGLADESH_DISTRICTS[0]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sync state when currentUser changes or modal opens
  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || "");
      // If phone starts with dummy prefix or empty, clear so user enters real phone
      const currentPhone = currentUser.phone || "";
      setPhone(currentPhone);
      setBloodGroup(currentUser.bloodGroup || "A+");
      setDistrict(currentUser.district || BANGLADESH_DISTRICTS[0]);
      setIsAvailable(currentUser.isAvailable ?? true);
      setLastDonationDate(currentUser.lastDonationDate || "");
      setAvatarUrl(currentUser.avatarUrl || "");
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [currentUser, isOpen]);

  // Calculate profile completion percentage
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (name.trim().length >= 2) score += 20;
    if (bloodGroup) score += 25;
    // Check if valid Bangladeshi phone number (11 digits e.g. 01XXXXXXXXX)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 11 && (cleanPhone.startsWith("013") || cleanPhone.startsWith("014") || cleanPhone.startsWith("015") || cleanPhone.startsWith("016") || cleanPhone.startsWith("017") || cleanPhone.startsWith("018") || cleanPhone.startsWith("019"))) {
      score += 25;
    } else if (cleanPhone.length >= 10) {
      score += 15;
    }
    if (district) score += 20;
    if (avatarUrl) score += 10;
    return Math.min(100, score);
  }, [name, bloodGroup, phone, district, avatarUrl]);

  // Eligibility calculation for last donation date
  const eligibility = useMemo(() => {
    return checkDonorEligibility(lastDonationDate);
  }, [lastDonationDate]);

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg(lang === "bn" ? "ছবির সাইজ সর্বাধিক ২ মেগাবাইট হতে পারবে।" : "Maximum image size is 2MB.");
      return;
    }

    setUploadingImg(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
      setUploadingImg(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name.trim()) {
      setErrorMsg(lang === "bn" ? "অনুগ্রহ করে আপনার নাম প্রদান করুন।" : "Please enter your name.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 11) {
      setErrorMsg(lang === "bn" ? "অনুগ্রহ করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017xxxxxxxx)।" : "Please provide a valid 11-digit phone number.");
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("blood_donation_token") || "";

    try {
      const response = await apiClient.updateProfile(
        {
          name: name.trim(),
          phone: cleanPhone,
          bloodGroup,
          district,
          isAvailable,
          lastDonationDate,
          avatarUrl,
        },
        token
      );

      setSuccessMsg(lang === "bn" ? "আপনার রক্তদাতা প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে!" : "Donor profile updated successfully!");
      onProfileUpdated(response.user);

      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || (lang === "bn" ? "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" : "Failed to update profile."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="complete-profile-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          id="complete-profile-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        >
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-6 sm:p-7 text-white">
            <button
              id="btn-close-profile-modal"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-bold shadow-inner">
                🩸
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/25 uppercase tracking-wider">
                  {lang === "bn" ? "রক্তদাতা তথ্যভাণ্ডার" : "Donor Profile System"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {lang === "bn" ? "প্রোফাইল সম্পূর্ণ করুন" : "Complete Your Profile"}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed max-w-md">
              {lang === "bn"
                ? "জরুরী প্রয়োজনে রোগী ও রক্ত সন্ধানীরা যাতে সহজেই আপনার সাথে যোগাযোগ করতে পারেন, সেজন্য তথ্যগুলো সঠিকভাবে প্রদান করুন।"
                : "Ensure your blood group and mobile number are accurate so recipients can contact you in emergencies."}
            </p>

            {/* Profile Completion Meter */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {lang === "bn" ? "প্রোফাইল সম্পূর্ণতা" : "Profile Completeness"}
                </span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px]">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className={`h-full rounded-full ${
                    completionPercentage >= 80
                      ? "bg-gradient-to-r from-emerald-400 to-teal-300"
                      : completionPercentage >= 50
                      ? "bg-gradient-to-r from-amber-400 to-yellow-300"
                      : "bg-gradient-to-r from-rose-300 to-white"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Body Form */}
          <form id="complete-profile-form" onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </motion.div>
            )}

            {/* Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="relative group shrink-0">
                <img
                  src={
                    avatarUrl ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150"
                  }
                  alt={name}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-rose-500/40 shadow-md"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImg}
                  />
                </label>
              </div>

              <div className="flex-1 w-full text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <p className="text-sm font-bold text-white">
                    {name || (lang === "bn" ? "ব্যবহারকারীর নাম" : "User Name")}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {bloodGroup} {lang === "bn" ? "রক্তদাতা" : "Donor"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentUser?.email || "user@gmail.com"}
                </p>
                <label className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-bold mt-2 cursor-pointer hover:underline">
                  <Camera className="w-3.5 h-3.5" />
                  {uploadingImg
                    ? (lang === "bn" ? "ছবি লোড হচ্ছে..." : "Uploading...")
                    : (lang === "bn" ? "ছবি পরিবর্তন করুন" : "Change Avatar")}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImg}
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-400" />
                {lang === "bn" ? "আপনার পূর্ণ নাম *" : "Full Name *"}
              </label>
              <input
                id="input-profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === "bn" ? "যেমন: মো: রাহাত হোসাইন" : "e.g., Rahad Hossain"}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Blood Group Quick Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-rose-500" />
                  {lang === "bn" ? "রক্তের গ্রুপ নির্বাচন করুন *" : "Select Blood Group *"}
                </span>
                <span className="text-[11px] text-rose-400 font-bold">
                  {lang === "bn" ? `নির্বাচিত: ${bloodGroup}` : `Selected: ${bloodGroup}`}
                </span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    id={`btn-select-blood-${bg}`}
                    type="button"
                    onClick={() => setBloodGroup(bg)}
                    className={`py-2 px-1 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center border ${
                      bloodGroup === bg
                        ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/40 scale-105"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:border-rose-500/50 hover:bg-slate-750"
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Phone Number */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-400" />
                  {lang === "bn" ? "সচল মোবাইল নম্বর (জরুরী প্রয়োজনে) *" : "Active Mobile Number *"}
                </label>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {lang === "bn" ? "সুরক্ষিত" : "Verified"}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">
                  +88
                </span>
                <input
                  id="input-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  maxLength={11}
                  required
                  className="w-full pl-12 pr-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 font-mono focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === "bn"
                  ? "💡 আপনার এই নম্বরে রক্ত সন্ধানী ও হাসপাতালের প্রতিনিধিরা যোগাযোগ করতে পারবেন।"
                  : "💡 Recipients and hospital staff will call this number in blood emergencies."}
              </p>
            </div>

            {/* District / Area Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {lang === "bn" ? "জেলা ও এলাকা নির্বাচন করুন *" : "District & Location *"}
              </label>
              <select
                id="select-profile-district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {BANGLADESH_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Donation Availability Toggle */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Heart className={`w-4 h-4 ${isAvailable ? "text-rose-500 fill-rose-500" : "text-slate-500"}`} />
                  {lang === "bn" ? "রক্তদানে আগ্রহী ও প্রস্তুত?" : "Ready & Available to Donate?"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAvailable
                    ? (lang === "bn" ? "হ্যাঁ, বর্তমানে আমি রক্ত দিতে সক্ষম" : "Yes, ready to donate blood")
                    : (lang === "bn" ? "না, সাময়িক বিরতিতে আছি" : "Currently on temporary break")}
                </p>
              </div>

              <button
                id="btn-toggle-availability"
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? "bg-rose-600" : "bg-slate-700"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Last Donation Date (Optional) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  {lang === "bn" ? "সর্বশেষ রক্তদানের তারিখ (যদি পূর্বে দিয়ে থাকেন)" : "Last Donation Date (Optional)"}
                </label>
                {lastDonationDate && (
                  <button
                    type="button"
                    onClick={() => setLastDonationDate("")}
                    className="text-[11px] text-slate-400 hover:text-rose-400 underline"
                  >
                    {lang === "bn" ? "মুছে ফেলুন" : "Clear"}
                  </button>
                )}
              </div>
              <input
                id="input-profile-last-donation"
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:border-rose-500 focus:outline-none"
              />

              {lastDonationDate && (
                <div className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                  eligibility.eligible
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-950/30 border-amber-500/30 text-amber-300"
                }`}>
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    {eligibility.eligible
                      ? (lang === "bn" ? "🎉 আপনি বর্তমানে রক্তদানে সম্পূর্ণরূপে যোগ্য!" : "🎉 You are currently fully eligible to donate!")
                      : (lang === "bn" ? `⏳ পরবর্তী রক্তদানের উপযুক্ত তারিখ: ${eligibility.nextDateStr} (আর ${eligibility.remainingDays} দিন বাকি)` : `⏳ Next eligible date: ${eligibility.nextDateStr} (${eligibility.remainingDays} days remaining)`)}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-save-complete-profile"
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-xl shadow-rose-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving Profile..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{lang === "bn" ? "প্রোফাইল সম্পন্ন ও সংরক্ষণ করুন" : "Save & Complete Profile"}</span>
                  </>
                )}
              </button>

              <button
                id="btn-cancel-profile-modal"
                type="button"
                onClick={onClose}
                className="py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-sm border border-slate-700 transition-colors"
              >
                {lang === "bn" ? "পরে করব" : "Skip for now"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
