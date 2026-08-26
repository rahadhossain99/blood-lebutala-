import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search, MapPin, Heart, Phone, Mail, Calendar, Check, AlertCircle, Unlock, Info } from "lucide-react";
import { BloodGroup, User } from "../types";
import { BANGLADESH_DISTRICTS, checkDonorEligibility } from "../utils";
import { apiClient } from "../apiClient";

interface DonorsSearchProps {
  currentUser: any;
  lang: "bn" | "en";
  translations: any;
  onOpenAuth: () => void;
  onTriggerBooking: (donor: User) => void;
}

export default function DonorsSearch({
  currentUser,
  lang,
  translations,
  onOpenAuth,
  onTriggerBooking,
}: DonorsSearchProps) {
  const [donors, setDonors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup | "">("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(false);

  const bloodGroups: BloodGroup[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Helper to localized number rendering
  const formatNumber = (num: number | string): string => {
    if (lang === "en") return num.toString();
    const bnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
      .toString()
      .split("")
      .map((char) => (/[0-9]/.test(char) ? bnNums[parseInt(char)] : char))
      .join("");
  };

  // Fetch donors with active filters
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("blood_donation_token");
      const data = await apiClient.getDonors(
        {
          bloodGroup: selectedGroup || undefined,
          district: selectedDistrict || undefined,
          isAvailable: onlyAvailable ? true : undefined,
        },
        token
      );
      setDonors(data);
    } catch (error) {
      console.error("Failed to load donors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, selectedDistrict, onlyAvailable, currentUser]);

  const isLoggedIn = !!currentUser;

  return (
    <div className="space-y-8" id="donors-search-viewport">
      {/* Search Header Text */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          {translations.findDonor}
        </h2>
        <p className="text-gray-500 text-sm">
          {lang === "bn"
            ? "আপনার কাঙ্ক্ষিত রক্তের গ্রুপ এবং জেলা নির্বাচন করে তাৎক্ষণিকভাবে রক্তদাতাদের সনাক্ত করুন।"
            : "Locate active blood donors in seconds. Filter by your needed category and native district."}
        </p>
      </div>

      {/* 1. Blood Group Selection Hex-Grid */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4" id="group-filter-box">
        <h4 className="text-sm font-bold text-gray-700 text-center tracking-wide uppercase">
          {translations.bloodGroup} {lang === "bn" ? "অনুযায়ী ফিল্টার" : "Quick Selection"}
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3" id="blood-groups-select-bar">
          {bloodGroups.map((group) => {
            const isSelected = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(isSelected ? "" : group)}
                className={`py-3 rounded-xl font-bold text-base transition-all transform active:scale-95 duration-200 cursor-pointer flex flex-col items-center justify-center ring-1 ${
                  isSelected
                    ? "bg-[#D32F2F] text-white ring-[#D32F2F] shadow-md shadow-red-200"
                    : "bg-gray-50 text-gray-800 hover:bg-red-50 hover:text-[#D32F2F] ring-gray-200"
                }`}
              >
                <span className="text-lg">{group}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Secondary Filter: District & Availability Toggles */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5" id="extended-filters-wrapper">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* District Selector */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin size={16} />
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-[#D32F2F] focus:border-transparent outline-hidden bg-white cursor-pointer"
            >
              <option value="">{translations.allDistricts}</option>
              {BANGLADESH_DISTRICTS.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Quick search button resetting filters */}
          {(selectedGroup || selectedDistrict || onlyAvailable) && (
            <button
              onClick={() => {
                setSelectedGroup("");
                setSelectedDistrict("");
                setOnlyAvailable(false);
              }}
              className="text-[#D32F2F] hover:underline text-xs text-left self-center font-semibold"
            >
              {lang === "bn" ? "সকল ফিল্টার মুছুন ✕" : "Clear All Filters ✕"}
            </button>
          )}
        </div>

        {/* Immediate availability slider */}
        <div className="flex items-center gap-3 p-3 bg-red-50/20 border border-red-100/30 rounded-xl" id="availability-slider-row">
          <label className="text-sm font-semibold text-gray-800 cursor-pointer select-none" htmlFor="avl-checkbox">
            ✓ {translations.availableDonors}
          </label>
          <input
            id="avl-checkbox"
            type="checkbox"
            checked={onlyAvailable}
            onChange={(e) => setOnlyAvailable(e.target.checked)}
            className="w-4 h-4 text-[#D32F2F] border-gray-300 rounded-md focus:ring-[#D32F2F] opacity-80 cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Donors Results Card Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-[#D32F2F]/20 border-t-[#D32F2F] rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-sans">
            {lang === "bn" ? "রক্তদাতা তালিকা লোড হচ্ছে..." : "Fetching eligible candidates..."}
          </p>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <AlertCircle className="mx-auto text-gray-300 h-12 w-12" />
          <p className="text-gray-800 font-bold">{translations.noDonorsFound}</p>
          <p className="text-xs text-gray-500">
            {lang === "bn"
              ? "অনুগ্রহ করে অন্য জেলা বা অন্য রক্তের গ্রুপ নির্বাচন করে চেষ্টা করুন।"
              : "Try switching districts or clear blood group locks to widen search boundaries."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="donors-cards-grid">
          {donors.map((donor, index) => {
            // Check eligibility based on last donation date (120 days cycle)
            const { eligible, remainingDays, nextDateStr } = checkDonorEligibility(donor.lastDonationDate);

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                key={donor.id}
                className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between hover:shadow-lg transition-all relative group"
              >
                {/* Available for direct assignment absolute pill */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      donor.isAvailable && eligible ? "bg-emerald-500 animate-pulse" : "bg-gray-300"
                    }`}
                  ></span>
                  <span className="text-[10px] font-bold text-gray-500">
                    {donor.isAvailable && eligible
                      ? (lang === "bn" ? "সক্রিয়" : "Active")
                      : (lang === "bn" ? "অউপলব্ধ" : "Inactive")}
                  </span>
                </div>

                {/* Blood icon and primary stats */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {/* Visual blood group coin or dynamic user avatar layout */}
                    <div className="relative shrink-0">
                      {donor.avatarUrl ? (
                        <div className="relative">
                          <img
                            src={donor.avatarUrl}
                            alt={donor.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-red-100 shadow-xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-[#D32F2F] text-white text-[9px] font-black font-sans px-1.5 py-0.5 rounded-lg border border-white leading-none shadow-xs">
                            {donor.bloodGroup}
                          </span>
                        </div>
                      ) : (
                        <div className="w-14 h-14 bg-red-50 hover:bg-[#D32F2F] group-hover:bg-[#D32F2F] group-hover:text-white transition-colors duration-300 text-[#D32F2F] rounded-2xl flex items-center justify-center font-sans text-xl font-black shadow-xs shrink-0 border border-red-100">
                          {donor.bloodGroup}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight block group-hover:text-[#D32F2F] transition-colors">
                        {donor.name}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1 font-sans">
                        <MapPin size={12} className="text-slate-400" />
                        {donor.district}
                      </p>
                    </div>
                  </div>

                  {/* Eligibility Banner */}
                  <div className="py-2.5 px-3 rounded-lg flex items-start gap-2 bg-gray-50">
                    {eligible ? (
                      <>
                        <Check size={14} className="text-emerald-500 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-semibold text-emerald-700">{translations.eligible}</p>
                          <p className="text-[10px] text-gray-500">
                            {donor.lastDonationDate
                              ? (lang === "bn" ? `শেষ দাম: ${donor.lastDonationDate}` : `Last active: ${donor.lastDonationDate}`)
                              : translations.neverDonated}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Info size={14} className="text-amber-500 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-semibold text-amber-700">{translations.notEligible}</p>
                          <p className="text-[10px] text-gray-500 font-sans">
                            {formatNumber(remainingDays)} {translations.daysRemaining} ({nextDateStr})
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Contact information details (Privacy Shielded or active) */}
                <div className="pt-5 mt-5 border-t border-gray-100 space-y-3">
                  {isLoggedIn ? (
                    <div className="space-y-2.5" id="contact-fields-unlocked">
                      {/* Phone connection list */}
                      <a
                        href={`tel:${donor.phone}`}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#D32F2F] transition-colors"
                      >
                        <Phone size={14} className="text-slate-400" />
                        <span className="font-sans">{donor.phone}</span>
                      </a>
                      {/* Email connection list */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail size={14} className="text-slate-400" />
                        <span className="font-sans break-all">{donor.email}</span>
                      </div>

                      {/* Schedule match directly */}
                      {eligible && donor.isAvailable && donor.id !== currentUser.id && (
                        <button
                          onClick={() => onTriggerBooking(donor)}
                          className="w-full mt-3 py-1.5 md:py-2 text-xs bg-red-50 hover:bg-[#D32F2F] hover:text-white text-[#D32F2F] transition-all duration-200 font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Heart size={12} />
                          {translations.bookNow}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="relative p-3 bg-slate-50 border border-slate-100 rounded-xl" id="contact-fields-locked-shield">
                      {/* Blur layout */}
                      <div className="filter blur-xs opacity-50 space-y-1.5 select-none text-[11px]">
                        <p className="flex items-center gap-2 text-gray-800 font-sans">
                          <Phone size={12} /> 01712******
                        </p>
                        <p className="flex items-center gap-2 text-gray-500 font-sans">
                          <Mail size={12} /> test*******@gmail.com
                        </p>
                      </div>

                      {/* Screen CTA Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={onOpenAuth}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#D32F2F] to-[#E53935] hover:from-[#E53935] hover:to-[#D32F2F] text-white text-[11px] font-bold rounded-lg shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Unlock size={11} />
                          {translations.loginButton} {lang === "bn" ? "প্রয়োজন" : "Required"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
