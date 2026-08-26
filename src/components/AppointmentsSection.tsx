import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, ClipboardCheck, Calendar, MapPin, Phone, Users, FileText, CheckCircle2, XCircle, HeartHandshake, Loader2 } from "lucide-react";
import { BloodGroup, Appointment, User } from "../types";
import { apiClient } from "../apiClient";

interface AppointmentsSectionProps {
  currentUser: any;
  preSelectedDonor: User | null;
  onClearPreSelectedDonor: () => void;
  lang: "bn" | "en";
  translations: any;
  onRefreshStats: () => void;
  onOpenAuth: () => void;
}

export default function AppointmentsSection({
  currentUser,
  preSelectedDonor,
  onClearPreSelectedDonor,
  lang,
  translations,
  onRefreshStats,
  onOpenAuth,
}: AppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [type, setType] = useState<"request" | "donate">("request");
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("A+");
  const [hospitalName, setHospitalName] = useState("");
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [unitsRequested, setUnitsRequested] = useState(1);
  const [remarks, setRemarks] = useState("");

  // Load user-specific appointments on login or mount
  const fetchMyAppointments = async () => {
    if (!currentUser) return;
    setLoadingList(true);
    try {
      const token = localStorage.getItem("blood_donation_token") || "";
      const data = await apiClient.getMyAppointments(token);
      setAppointments(data);
    } catch (err) {
      console.error("Failed to load personal appointments", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMyAppointments();
  }, [currentUser]);

  // Hook to handle preSelectedDonor triggers from the search screen
  useEffect(() => {
    if (preSelectedDonor) {
      setType("request");
      setBloodGroup(preSelectedDonor.bloodGroup);
      setRemarks(`${lang === "bn" ? "রক্তদাতা" : "Donor"}: ${preSelectedDonor.name} (${preSelectedDonor.phone}) ${lang === "bn" ? "কে সরাসরি অনুরোধ করা হচ্ছে।" : "recalled directly."}`);
      setShowFormModal(true);
    }
  }, [preSelectedDonor]);

  // Cancel appointment handler
  const handleCancelAppt = async (id: string) => {
    if (!window.confirm(lang === "bn" ? "আপনি কি এই অ্যাপয়েন্টমেন্ট বাতিল করতে চান?" : "Are you sure you want to cancel this request?")) return;

    try {
      const token = localStorage.getItem("blood_donation_token") || "";
      await apiClient.updateAppointmentStatus(id, "cancelled", token);
      fetchMyAppointments();
      onRefreshStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Submit appointment / request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBtnLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload: any = {
      type,
      bloodGroup,
      hospitalName,
      contactPhone,
      date,
      time,
      unitsRequested,
      remarks,
    };

    if (type === "request") {
      payload.patientName = patientName || (lang === "bn" ? "রক্তের চাহিদা" : "Blood Request");
      if (preSelectedDonor) {
        payload.donorId = preSelectedDonor.id;
        payload.donorName = preSelectedDonor.name;
      }
    } else {
      payload.donorName = currentUser?.name || (lang === "bn" ? "স্বেচ্ছাসেবী রক্তদাতা" : "Volunteer Donor");
      payload.donorId = currentUser?.id;
    }

    try {
      const token = localStorage.getItem("blood_donation_token");
      await apiClient.createAppointment(payload, token);

      setSuccessMsg(lang === "bn" ? "আপনার অনুরোধ সফলভাবে পোস্ট করা হয়েছে!" : "Successfully scheduled/requested!");
      onRefreshStats();

      // Clear fields
      setPatientName("");
      setHospitalName("");
      setRemarks("");
      setUnitsRequested(1);
      
      // Auto close and update list
      setTimeout(() => {
        setShowFormModal(false);
        setSuccessMsg("");
        onClearPreSelectedDonor();
        fetchMyAppointments();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || translations.errorAction);
    } finally {
      setBtnLoading(false);
    }
  };

  const getStatusStyle = (status: Appointment["status"]) => {
    switch (status) {
      case "pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "approved": return "text-blue-600 bg-blue-50 border-blue-200";
      case "completed": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  // Help format English numbers in Bengali UI
  const formatNumber = (num: number): string => {
    if (lang === "en") return num.toString();
    const bnNums = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().split("").map((char) => (/[0-9]/.test(char) ? bnNums[parseInt(char)] : char)).join("");
  };

  return (
    <div className="space-y-8" id="appt-section-container">
      {/* Upper Panel triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-gray-100 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="text-[#D32F2F]" size={22} />
            {lang === "bn" ? "রক্তদান বুকিং এবং চাহিদাপত্র" : "Donations and Requisitions Scheduler"}
          </h2>
          <p className="text-xs text-gray-500">
            {lang === "bn"
              ? "সরাসরি ব্লাড ব্যাংকে দানের অ্যাপয়েন্টমেন্ট নিন অথবা জরুরী রক্তের প্রয়োজনে আবেদন করুন।"
              : "Register diagnostic donations or release immediate blood request postings."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Request blood */}
          <button
            onClick={() => {
              setType("request");
              onClearPreSelectedDonor();
              setShowFormModal(true);
            }}
            className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={16} />
            {translations.requestNow}
          </button>

          {/* Quick Donate appointment */}
          <button
            onClick={() => {
              if (!currentUser) {
                onOpenAuth();
                return;
              }
              setType("donate");
              onClearPreSelectedDonor();
              setShowFormModal(true);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HeartHandshake size={16} />
            {translations.donateBlood}
          </button>
        </div>
      </div>

      {/* Booking history list displayed for logged-in user */}
      {currentUser ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 space-y-6" id="my-appointments-pnl">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#D32F2F] rounded-full"></span>
            {translations.myAppointments} ({formatNumber(appointments.length)})
          </h3>

          {loadingList ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-red-200 border-t-[#D32F2F] rounded-full animate-spin"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Calendar className="mx-auto text-gray-300 h-10 w-10 animate-bounce" />
              <p className="text-sm text-gray-500">
                {lang === "bn" ? "আপনি এখনও কোনো বুকিং বা চাহিদা অনুরোধ করেননি।" : "You don't have active slots scheduled."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="user-appointments-grid">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 rounded-xl border border-slate-100 hover:border-slate-200 bg-[#fbfbfb]/40 relative flex flex-col justify-between gap-4 group"
                >
                  {/* Absolute Badge Category */}
                  <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusStyle(appt.status)}`}>
                    {appt.status.toUpperCase()}
                  </span>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-red-50 text-[#D32F2F] rounded-md font-sans font-bold flex items-center justify-center text-xs">
                        {appt.bloodGroup}
                      </span>
                      <p className="font-bold text-gray-900 text-sm">
                        {appt.type === "request" ? (
                          <>
                            {lang === "bn" ? "চাহিদা:" : "Request:"} {appt.patientName}
                          </>
                        ) : (
                          <>{lang === "bn" ? "স্বেচ্ছায় রক্তদান সূচি" : "Voluntary Donation Slot"}</>
                        )}
                      </p>
                    </div>

                    {/* Meta Details */}
                    <div className="text-xs space-y-2 text-gray-600">
                      <p className="flex items-start gap-1.5 font-sans">
                        <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <span>{appt.hospitalName}</span>
                      </p>

                      <p className="flex items-center gap-1.5 font-sans">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{appt.date} | {appt.time}</span>
                      </p>

                      {appt.type === "request" && (
                        <p className="text-red-500 font-semibold font-sans">
                          {lang === "bn" ? "চাহিদা সীমা:" : "Units needed:"} {formatNumber(appt.unitsRequested || 1)} {lang === "bn" ? "ব্যাগ" : "Unit(s)"}
                        </p>
                      )}

                      {appt.remarks && (
                        <p className="bg-gray-50 p-2 rounded text-[11px] text-gray-500 italic">
                          "{appt.remarks}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Cancel slot option if pending */}
                  {(appt.status === "pending" || appt.status === "approved") && (
                    <button
                      onClick={() => handleCancelAppt(appt.id)}
                      className="mt-2 py-1.5 bg-rose-50 hover:bg-[#D32F2F] hover:text-white text-rose-600 transition-colors font-semibold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle size={14} />
                      {lang === "bn" ? "অনুরোধটি বাতিল করুন" : "Cancel Slot"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-red-50/20 rounded-2xl border border-dashed border-red-200 p-8 text-center space-y-4" id="member-booking-prompt">
          <p className="text-sm font-medium text-gray-700">
            {lang === "bn"
              ? "আপনার রক্তের চাহিদাপত্র ও বুকিং হিস্ট্রি সংরক্ষণ করতে এবং রিয়েল-টাইম আপডেট পেতে মেম্বার লগইন করুন।"
              : "To save your detailed requests & booking trails and get approval updates, register as a member."}
          </p>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2 inline-flex items-center gap-2 bg-[#D32F2F] text-white hover:bg-[#B71C1C] text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-red-100"
          >
            {translations.login} / {translations.register}
          </button>
        </div>
      )}

      {/* Appointment Creation Modal Form */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" id="appointment-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative border border-gray-100"
              id="appointment-form-modal"
            >
              {/* Modal Head */}
              <div className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold select-none">{translations.appointmentModalTitle}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 font-sans">
                    {preSelectedDonor ? `${lang === "bn" ? "অনুরোধ পাঠানো হচ্ছে সরাসরি রক্তদাতাকে" : "Requesting donor directly"}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    onClearPreSelectedDonor();
                  }}
                  className="text-gray-400 hover:text-white rounded-full p-1"
                >
                  ✕
                </button>
              </div>

              {/* Form Element */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto" id="appt-setup-form">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-xs font-sans">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-700 text-xs font-sans flex items-center gap-2">
                    <CheckCircle2 size={16} /> {successMsg}
                  </div>
                )}

                {/* Switch Booking Type (Only if not pre-selected) */}
                {!preSelectedDonor && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {lang === "bn" ? "আবেদনের ধরণ" : "Application Type"}
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setType("request")}
                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          type === "request" ? "bg-white text-[#D32F2F] shadow-xs" : "text-gray-600"
                        }`}
                      >
                        {translations.typeRequest}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            onOpenAuth();
                            return;
                          }
                          setType("donate");
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          type === "donate" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-600"
                        }`}
                      >
                        {translations.typeDonate}
                      </button>
                    </div>
                  </div>
                )}

                {/* Patient Name / Requisition Topic */}
                {type === "request" && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.patientName} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder={lang === "bn" ? "যেমন: সাবিহা রহমান (হার্ট অপারেশন)" : "e.g. Sabiha Rahman (Heart Surgery)"}
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F]"
                      />
                    </div>
                  </div>
                )}

                {/* Blood Group and units required */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.bloodGroup} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bloodGroup}
                      disabled={!!preSelectedDonor}
                      onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] bg-white"
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {type === "request" ? translations.units : (lang === "bn" ? "দানকৃত ব্যাগ সংখ্যা" : "Bags Intended")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="10"
                      value={unitsRequested}
                      onChange={(e) => setUnitsRequested(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F]"
                    />
                  </div>
                </div>

                {/* Hospital Address details */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {translations.hospitalName} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder={lang === "bn" ? "যেমন: ঢাকা বারডেম জেনারেল হাসপাতাল" : "e.g. Dhaka BIRDEM General Hospital"}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F]"
                    />
                  </div>
                </div>

                {/* Schedule Day and Hour */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.date} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {translations.time} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] font-sans"
                    />
                  </div>
                </div>

                {/* Contact phone representation */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {translations.phone} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. 01700000000"
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F] font-sans"
                    />
                  </div>
                </div>

                {/* Remarks commentary */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {translations.remarks} <span className="text-gray-400">({lang === "bn" ? "ঐচ্ছিক" : "Optional"})</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      rows={2}
                      placeholder={lang === "bn" ? "রক্তের সন্ধান বা রোগীর অবস্থা সম্পর্কে অন্য তথ্য দিন..." : "Any diagnosis or extra parameters..."}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#D32F2F]"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFormModal(false);
                      onClearPreSelectedDonor();
                    }}
                    className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                  >
                    {translations.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={btnLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-xl flex items-center gap-1 cursor-pointer shadow-md shadow-red-100 disabled:opacity-50"
                  >
                    {btnLoading ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                    ) : (
                      translations.submit
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
