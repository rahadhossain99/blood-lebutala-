import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, Heart, ClipboardList, CheckCircle2, ShieldCheck, 
  Edit3, Save, RotateCcw, User, Phone, MapPin, Calendar, 
  ToggleLeft, ToggleRight, Loader2, Sparkles, AlertCircle, Info, Flame 
} from "lucide-react";
import { BloodGroup, Appointment, DashboardStats } from "../types";
import { BANGLADESH_DISTRICTS } from "../utils";
import { apiClient } from "../apiClient";

interface StatsDashboardProps {
  stats: DashboardStats;
  currentUser: any;
  lang: "bn" | "en";
  translations: any;
  onRefreshStats: () => void;
  onUpdateApptStatus: (id: string, nextStatus: Appointment["status"]) => void;
  onUpdateUser: (user: any) => void;
}

export default function StatsDashboard({
  stats,
  currentUser,
  lang,
  translations,
  onRefreshStats,
  onUpdateApptStatus,
  onUpdateUser,
}: StatsDashboardProps) {
  const [editingStock, setEditingStock] = useState(false);
  const [stockForm, setStockForm] = useState<Record<BloodGroup, number>>({ ...stats.bloodStock });
  const [submittingStock, setSubmittingStock] = useState(false);

  // Profile control panel client states
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBlood, setProfileBlood] = useState<BloodGroup>("O+");
  const [profileDist, setProfileDist] = useState(BANGLADESH_DISTRICTS[0]);
  const [profileAvail, setProfileAvail] = useState(true);
  const [profileDonationDate, setProfileDonationDate] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Sync profile values when currentUser details load/change
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || "");
      setProfilePhone(currentUser.phone || "");
      setProfileBlood(currentUser.bloodGroup || "O+");
      setProfileDist(currentUser.district || BANGLADESH_DISTRICTS[0]);
      setProfileAvail(currentUser.isAvailable ?? true);
      setProfileDonationDate(currentUser.lastDonationDate || "");
      setProfileAvatar(currentUser.avatarUrl || "");
    }
  }, [currentUser]);

  // Handle local avatar file conversion to base64
  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(lang === "bn" ? "ছবির সাইজ সর্বাধিক ২ মেগাবাইট হতে পারবে।" : "Maximum photo size is 2MB.");
      return;
    }

    setUploadingImg(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileAvatar(reader.result as string);
      setUploadingImg(false);
    };
    reader.readAsDataURL(file);
  };

  // Profile Form submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    const token = localStorage.getItem("blood_donation_token") || "";
    try {
      const data = await apiClient.updateProfile(
        {
          name: profileName,
          phone: profilePhone,
          bloodGroup: profileBlood,
          district: profileDist,
          isAvailable: profileAvail,
          lastDonationDate: profileDonationDate,
          avatarUrl: profileAvatar,
        },
        token
      );

      onUpdateUser(data.user);
      setProfileSuccess(lang === "bn" ? "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" : "Profile updated successfully!");
      onRefreshStats();
      setTimeout(() => setProfileSuccess(""), 4000);
    } catch (err: any) {
      setProfileError(err.message || "সার্ভার সংযোগ ত্রুটি");
      setTimeout(() => setProfileError(""), 4000);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const recentBookings = stats.recentBookings || (stats as any).recentAppointments || [];

  const handleEditToggle = () => {
    setStockForm({ ...stats.bloodStock });
    setEditingStock(!editingStock);
  };

  const handleSaveStock = async () => {
    setSubmittingStock(true);
    const token = localStorage.getItem("blood_donation_token") || "";
    try {
      await apiClient.updateBloodStocks(stockForm, token);
      onRefreshStats();
      setEditingStock(false);
    } catch {
      alert(translations.errorAction);
    } finally {
      setSubmittingStock(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (lang === "en") return num.toString();
    const bnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toString()
      .split("")
      .map((char) => (/[0-9]/.test(char) ? bnNums[parseInt(char)] : char))
      .join("");
  };

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const getStockFillHeight = (units: number) => {
    const maxVal = 40;
    const percentage = (units / maxVal) * 100;
    return Math.min(100, Math.max(5, percentage));
  };

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-[#a7f3d0]";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return translations.statusPending;
      case "approved":
        return translations.statusApproved;
      case "completed":
        return translations.statusCompleted;
      case "cancelled":
        return translations.statusCancelled;
      default:
        return status;
    }
  };

  const isAdmin = currentUser?.role === "admin";

  // Calculate clinical donation eligibility calculations
  const getEligibilityState = () => {
    if (!currentUser || !profileDonationDate) {
      return { eligible: true, daysLeft: 0, percent: 100 };
    }
    const lastDate = new Date(profileDonationDate);
    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const remainingDays = Math.max(0, 120 - diffDays);
    const progressPercent = Math.min(100, Math.round((diffDays / 120) * 100));

    return {
      eligible: remainingDays <= 0,
      daysLeft: remainingDays,
      percent: progressPercent
    };
  };

  const eligibility = getEligibilityState();

  return (
    <div className="space-y-10" id="stats-dashboard-container">
      {/* 1. Header with Refresh System */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span className="p-1 px-2.5 bg-red-600 text-white rounded text-sm font-sans font-black tracking-widest uppercase">KPI</span>
            {translations.statsTitle}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {lang === "bn"
              ? "রক্তের রিয়েল-টাইম স্টক, উপলব্ধ দাতা পরিসংখ্যান এবং জরুরি চিকিৎসা আবেদন মনিটর পোর্টাল।"
              : "Monitor real-time blood stock levels, ready donors and urgent clinical postings."}
          </p>
        </div>
        <button
          onClick={onRefreshStats}
          id="refresh-stats-btn"
          className="self-start sm:self-auto px-4 py-2.5 text-xs font-bold text-gray-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-[#D32F2F] shadow-sm active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw size={14} className="animate-spin-hover" />
          {lang === "bn" ? "রিফ্রেশ করুন" : "Refresh Metrics"}
        </button>
      </div>

      {/* 2. Overarching Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="metrics-card-grid">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md shadow-slate-100/30 flex items-center gap-5 hover:border-red-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          <div className="p-4 bg-red-50 rounded-xl text-[#D32F2F] shrink-0">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{translations.totalDonors}</p>
            <h4 className="text-3xl font-black tracking-tight text-gray-900 mt-1 font-sans">
              {formatNumber(stats.totalDonors)}
            </h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md shadow-slate-100/30 flex items-center gap-5 hover:border-emerald-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
            <Heart size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{translations.availableDonors}</p>
            <h4 className="text-3xl font-black tracking-tight text-emerald-600 mt-1 font-sans">
              {formatNumber(stats.availableDonors)}
            </h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-md shadow-slate-100/30 flex items-center gap-5 hover:border-blue-100 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600 shrink-0">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{translations.successfulDonors}</p>
            <h4 className="text-3xl font-black tracking-tight text-blue-600 mt-1 font-sans">
              {formatNumber(stats.totalDonations)}
            </h4>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Beautiful Custom Profile Control Panel & Core Settings (Registered Logged-in Users) */}
      <AnimatePresence>
        {currentUser && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-150 shadow-xl overflow-hidden"
            id="donor-hub-hub"
          >
            {/* Control Panel Subheader */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles size={11} className="text-yellow-400" /> {lang === "bn" ? "প্রোফাইল কন্ট্রোল প্যানেল" : "DONOR CONTROL HUB"}
                </span>
                <h3 className="text-xl font-black tracking-tight mt-2 flex items-center gap-2">
                  {lang === "bn" ? `স্বাগতম, ${currentUser.name}!` : `Welcome back, ${currentUser.name}!`}
                  {currentUser.role === "admin" && (
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">SYSTEM ADMIN</span>
                  )}
                </h3>
              </div>

              {/* Instant Eligibility Ribbon */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-bold">
                  {lang === "bn" ? "রক্তদান যোগ্যতা অবস্থা:" : "Next Donation Status:"}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide ${
                  eligibility.eligible 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25 animate-pulse" 
                    : "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                }`}>
                  {eligibility.eligible 
                    ? (lang === "bn" ? "রক্তদানের জন্য প্রস্তুত! 🎉" : "Ready to Donate! 🎉") 
                    : (lang === "bn" ? `পুনরুদ্ধার চক্রে (${eligibility.percent}%)` : `Recovering (${eligibility.percent}%)`)}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Visual Eligibility meters & Info card */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
                  {/* Portrait photo circular frame */}
                  <div className="relative">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl ring-2 ring-red-500" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-red-50 text-red-500 font-sans flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl ring-2 ring-red-300">
                        🩸
                      </div>
                    )}
                    <span className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white ${profileAvail ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-800 leading-tight">{profileName || currentUser.name}</h4>
                    <p className="text-xs text-slate-400 font-bold font-mono tracking-widest">{currentUser.email}</p>
                    <p className="text-xs font-extrabold text-slate-600 mt-1 flex items-center justify-center gap-1">
                      <MapPin size={13} className="text-red-500" /> {profileDist}
                    </p>
                  </div>

                  {/* Eligibility Horizontal progress count */}
                  <div className="w-full space-y-2 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">{lang === "bn" ? "অস্থিমজ্জা পুনরুদ্ধার লেভেল" : "Clinical Cell Regeneration"}</span>
                      <span className="font-black text-rose-600 font-sans">{eligibility.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${eligibility.eligible ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-red-500 to-amber-500"}`}
                        style={{ width: `${eligibility.percent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>{profileDonationDate ? (lang === "bn" ? `শেষ রক্তদান: ${profileDonationDate}` : `Last: ${profileDonationDate}`) : (lang === "bn" ? "কোন রেকর্ড নেই" : "No date record")}</span>
                      <span>{!eligibility.eligible && (lang === "bn" ? `আর ${eligibility.daysLeft} দিন` : `${eligibility.daysLeft} days left`)}</span>
                    </div>
                  </div>
                </div>

                {/* Important medical reminder */}
                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 flex gap-3 text-xs text-red-800 leading-relaxed">
                  <ShieldCheck className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <span className="font-bold block mb-0.5">{lang === "bn" ? "দাতাদের উদ্দেশ্যে নীতি নির্দেশিকা:" : "Core Volunteer Guidelines:"}</span>
                    {lang === "bn"
                      ? "সুস্থ ও সবল রক্তদাতা প্রতি ৪ মাস পর পর নিরাপদে রক্ত দিতে পারেন। আপনার সঠিক মোবাইল নম্বর ও এলাকা সেট করে রাখুন যাতে জরুরী প্রয়োজনে রোগীরা আপনাকে সহজে খুঁজে পায়।"
                      : "Healthy ready individuals can safely donate blood every 120 days. Ensure your mobile number is formatted correctly and location maps to your active district."}
                  </div>
                </div>
              </div>

              {/* Right Column: Direct dynamic profile settings form */}
              <form onSubmit={handleUpdateProfile} className="lg:col-span-7 space-y-4">
                {profileSuccess && (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />
                    {profileSuccess}
                  </motion.div>
                )}
                {profileError && (
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="text-rose-500 shrink-0" size={16} />
                    {profileError}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.name}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-blue-100 bg-slate-50/30 focus:bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] text-xs font-semibold"
                      />
                    </div>
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.phone}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-blue-100 bg-slate-50/30 focus:bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Blood group select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.bloodGroup}
                    </label>
                    <select
                      value={profileBlood}
                      onChange={(e) => setProfileBlood(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 border border-blue-100 bg-slate-50/30 focus:bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] text-xs font-semibold"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* District select */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.district}
                    </label>
                    <select
                      value={profileDist}
                      onChange={(e) => setProfileDist(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-100 bg-slate-50/30 focus:bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] text-xs font-semibold"
                    >
                      {BANGLADESH_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Last Donation Date selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.lastDonation}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={profileDonationDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setProfileDonationDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-blue-100 bg-slate-50/30 focus:bg-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] text-xs font-semibold font-sans"
                      />
                    </div>
                  </div>

                  {/* Image input for portrait upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {lang === "bn" ? "প্রোফাইল ছবি পরিবর্তন করুন" : "Upload Custom Avatar Photo"}
                    </label>
                    <input
                      type="file"
                      id="dashboard-avatar-uploader"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                    <label
                      htmlFor="dashboard-avatar-uploader"
                      className="w-full px-3 py-2 border border-dashed border-slate-300 hover:border-[#D32F2F] rounded-lg transition-colors cursor-pointer block text-center text-xs font-bold text-slate-600 bg-slate-50/30 hover:bg-slate-50 leading-loose"
                    >
                      {uploadingImg ? (lang === "bn" ? "ফাইল আপলোড হচ্ছে..." : "Processing File...") : (lang === "bn" ? "📸 নতুন ছবি নির্বাচন করুন" : "📸 Choose New Portrait File")}
                    </label>
                  </div>
                </div>

                {/* Immediate Emergency Availability Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/50">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-800">
                      {translations.isAvailableToggle}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {lang === "bn" ? "টিকমার্ক অন থাকলে দাতা তালিকায় আপনাকে খুঁজে পাওয়া যাবে" : "Toggled active makes you instantly discoverable to patients"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileAvail(!profileAvail)}
                    className="p-1 transition-transform active:scale-95 cursor-pointer"
                  >
                    {profileAvail ? (
                      <ToggleRight size={44} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={44} className="text-slate-400" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-red-200/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="dashboard-save-profile-btn"
                >
                  {updatingProfile ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4" />
                      {lang === "bn" ? "প্রোফাইল সংরক্ষণ হচ্ছে..." : "Saving Profile Changes..."}
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      {lang === "bn" ? "প্রোফাইল তথ্য ও সংরক্ষণ করুন" : "Save Selected Profile Specifications"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 3. Visual Blood Stocks Grid */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-md shadow-slate-100/30 space-y-6" id="blood-inventory-box">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#D32F2F] rounded-full inline-block animate-pulse"></span>
              {lang === "bn" ? "রক্ত ব্যাংক ব্যাগ স্টোরেজ" : "Blood Bank Unit Inventory"}
            </h3>
            <p className="text-xs text-gray-500">
              {lang === "bn"
                ? "ব্যাগ সংখ্যা অনুযায়ী ফিলআপ লেভেল নির্দেশ করছে (টপমাস্ট ধারণ ক্ষমতা: ৪০ ব্যাগ)"
                : "Fill levels corresponding to stock unit counts (Maximum threshold: 40 Bags/Group)"}
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={handleEditToggle}
              id="admin-stock-edit-toggle"
              className="px-3.5 py-2 text-xs font-bold text-[#D32F2F] bg-red-50 hover:bg-[#D32F2F] hover:text-white transition-all rounded-xl flex items-center gap-1 cursor-pointer hover:shadow-md"
            >
              <Edit3 size={13} />
              {translations.adjustStockTitle}
            </button>
          )}
        </div>

        {/* Blood inventory liquid displays */}
        {editingStock ? (
          <div className="p-6 bg-red-50/40 rounded-xl border border-red-100 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4 shadow-inner">
            {bloodGroups.map((group) => (
              <div key={group} className="flex flex-col items-center bg-white p-3 rounded-xl border border-slate-100 shadow-xs">
                <span className="text-sm font-black text-gray-700 mb-2">{group}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stockForm[group] || 0}
                  onChange={(e) =>
                    setStockForm({ ...stockForm, [group]: Math.max(0, parseInt(e.target.value) || 0) })
                  }
                  className="w-16 text-center border border-gray-200 rounded-lg py-1.5 text-sm font-black focus:ring-1 focus:ring-[#D32F2F] focus:outline-hidden bg-slate-50 font-sans"
                />
              </div>
            ))}
            <div className="col-span-full flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setEditingStock(false)}
                className="px-4 py-2 text-xs font-bold text-gray-550 hover:text-slate-800 bg-slate-150 rounded-xl hover:bg-slate-200 cursor-pointer transition-colors"
                id="stock-cancel-btn"
              >
                {translations.cancel}
              </button>
              <button
                type="button"
                disabled={submittingStock}
                onClick={handleSaveStock}
                className="px-4 py-2 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                id="stock-save-btn"
              >
                {submittingStock ? (
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                ) : (
                  <Save size={13} />
                )}
                {lang === "bn" ? "সংরক্ষণ করুন" : "Save Stock"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-6 pt-4" id="inventory-liquid-grid">
            {bloodGroups.map((group) => {
              const units = stats.bloodStock[group] || 0;
              const fillPercentage = getStockFillHeight(units);

              return (
                <div key={group} className="flex flex-col items-center group">
                  {/* The Liquid Container Representing a Blood Bag */}
                  <div className="w-16 h-32 bg-gray-50 border-2 border-slate-200 rounded-t-lg rounded-b-2xl relative overflow-hidden flex flex-col justify-end shadow-sm group-hover:border-[#D32F2F] transition-all duration-300 group-hover:shadow-md">
                    {/* Hanger loop style on top */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-2 bg-gray-300 rounded-full border border-gray-400 opacity-60"></div>

                    {/* Filling animated liquid wave */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${fillPercentage}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="w-full bg-gradient-to-t from-[#B71C1C] to-[#E53935] relative"
                    >
                      {/* Top shine reflection */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20"></div>
                    </motion.div>

                    {/* Centered Blood Group Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mix-blend-difference text-white">
                      <span className="text-xl font-bold tracking-wider">{group}</span>
                      <span className="text-xs font-semibold">{formatNumber(units)}u</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 mt-2 block group-hover:text-red-700 transition-colors">
                    {formatNumber(units)} {translations.stockBags}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Live Broadcast / Emergency Requests Field */}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-md shadow-slate-100/30 space-y-6" id="recent-requests-board">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-amber-500 rounded-full inline-block animate-pulse"></span>
          {translations.recentDonations}
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-100" id="requests-table-wrapper">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-650 font-bold border-b border-gray-100 uppercase text-[10px] tracking-wider">
                <th className="py-4 px-4">{lang === "bn" ? "আবেদনকারী / বিবরণ" : "Requester / Activity"}</th>
                <th className="py-4 px-4">{translations.bloodGroup}</th>
                <th className="py-4 px-4">{translations.hospitalName}</th>
                <th className="py-4 px-4">{translations.date} & {translations.time}</th>
                <th className="py-4 px-4 text-center">{lang === "bn" ? "অবস্থা" : "Status"}</th>
                {currentUser && <th className="py-4 px-4 text-right">{lang === "bn" ? "অ্যাকশন" : "Update"}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={currentUser ? 6 : 5} className="py-8 text-center text-gray-450 font-medium">
                    {lang === "bn" ? "কোন সাম্প্রতিক আবেদন তথ্য নেই।" : "No recent blood postings."}
                  </td>
                </tr>
              ) : (
                recentBookings.map((appt) => (
                  <tr key={appt.id} className="hover:bg-red-50/10 transition-colors">
                    {/* Patient detail or donor match */}
                    <td className="py-4 px-4">
                      {appt.type === "request" ? (
                        <div>
                          <p className="font-bold text-gray-900">{appt.patientName || (lang === "bn" ? "অজ্ঞাতনামา রোগী" : "Anonymous Patient")}</p>
                          <div className="flex items-center gap-1 text-[11px] text-rose-600 font-extrabold mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></span>
                            <span>{lang === "bn" ? `জরুরী চাহিদা: ${formatNumber(appt.unitsRequested || 1)} ব্যাগ` : `Emergency: ${appt.unitsRequested} Unit(s)`}</span>
                          </div>
                          {appt.remarks && <p className="text-[11px] text-gray-500 italic mt-1 line-clamp-1">"{appt.remarks}"</p>}
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-gray-900">{appt.donorName || (lang === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা" : "Volunteer Donor")}</p>
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/60 inline-block mt-0.5">
                            {lang === "bn" ? "নির্ধারিত স্লট অ্যাপয়েন্টমেন্ট" : "Scheduled Donation"}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Blood group */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-[#D32F2F] text-xs font-extrabold ring-1 ring-red-200">
                        {appt.bloodGroup}
                      </span>
                    </td>

                    {/* Hospital address */}
                    <td className="py-4 px-4 text-gray-600 font-sans text-xs">
                      {appt.hospitalName}
                    </td>

                    {/* Clock dates */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-700 font-sans text-xs">{appt.date}</p>
                      <p className="text-xs text-gray-400 font-sans">{appt.time}</p>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(appt.status)}`}>
                        {getStatusLabel(appt.status)}
                      </span>
                    </td>

                    {/* Optional Admin/Authorised response trigger */}
                    {currentUser && (
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {appt.status === "pending" && (
                            <button
                              onClick={() => onUpdateApptStatus(appt.id, "approved")}
                              className="px-2.5 py-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg transition-all font-bold cursor-pointer"
                            >
                              {lang === "bn" ? "অনুমোদন" : "Approve"}
                            </button>
                          )}
                          {appt.status === "approved" && (
                            <button
                              onClick={() => onUpdateApptStatus(appt.id, "completed")}
                              className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg transition-all font-bold cursor-pointer"
                            >
                              {lang === "bn" ? "সম্পন্ন" : "Complete"}
                            </button>
                          )}
                          {appt.status !== "completed" && appt.status !== "cancelled" && (
                            <button
                              onClick={() => onUpdateApptStatus(appt.id, "cancelled")}
                              className="px-2.5 py-1 text-xs bg-rose-50 text-rose-600 hover:bg-[#D32F2F] hover:text-white rounded-lg transition-all font-bold cursor-pointer"
                            >
                              {lang === "bn" ? "বাতিল" : "Cancel"}
                            </button>
                          )}
                          {(appt.status === "completed" || appt.status === "cancelled") && (
                            <span className="text-[11px] text-gray-400 font-bold tracking-wider select-none bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                              {lang === "bn" ? "লকড" : "Archived"}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
