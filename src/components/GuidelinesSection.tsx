import React from "react";
import { motion } from "motion/react";
import { 
  Heart, ShieldCheck, AlertCircle, CheckCircle2, 
  HelpCircle, Clock, Droplet, UserCheck, PhoneCall, Sparkles, BookOpen 
} from "lucide-react";
import { BloodGroup } from "../types";

interface GuidelinesSectionProps {
  lang: "bn" | "en";
  translations: any;
  onNavigateToSearch: () => void;
  onNavigateToRequest: () => void;
}

export default function GuidelinesSection({
  lang,
  translations,
  onNavigateToSearch,
  onNavigateToRequest,
}: GuidelinesSectionProps) {
  const isBn = lang === "bn";

  const bloodCompatibility = [
    { group: "A+", canGiveTo: ["A+", "AB+"], canReceiveFrom: ["A+", "A-", "O+", "O-"] },
    { group: "O+", canGiveTo: ["O+", "A+", "B+", "AB+"], canReceiveFrom: ["O+", "O-"] },
    { group: "B+", canGiveTo: ["B+", "AB+"], canReceiveFrom: ["B+", "B-", "O+", "O-"] },
    { group: "AB+", canGiveTo: ["AB+"], canReceiveFrom: ["All (সকল গ্রুপ)"] },
    { group: "A-", canGiveTo: ["A+", "A-", "AB+", "AB-"], canReceiveFrom: ["A-", "O-"] },
    { group: "O-", canGiveTo: ["All (সর্বজনীন দাতা)"], canReceiveFrom: ["O-"] },
    { group: "B-", canGiveTo: ["B+", "B-", "AB+", "AB-"], canReceiveFrom: ["B-", "O-"] },
    { group: "AB-", canGiveTo: ["AB+", "AB-"], canReceiveFrom: ["AB-", "A-", "B-", "O-"] },
  ];

  const eligibilityRules = isBn
    ? [
        { title: "বয়স ও ওজন", desc: "বয়স ১৮ থেকে ৬০ বছর এবং ওজন কমপক্ষে ৪৫ কেজি (পুরুষদের ৫০ কেজি) হতে হবে।" },
        { title: "বিরতি সময়কাল", desc: "পূর্ববর্তী রক্তদানের পর কমপক্ষে ১২০ দিন (৪ মাস) অতিবাহিত হতে হবে।" },
        { title: "হিমোগ্লোবিনের মাত্রা", desc: "রক্তে হিমোগ্লোবিনের পরিমাণ ১২.৫ গ্রাম/ডেসিলিটার বা তার বেশি হতে হবে।" },
        { title: "সুস্বাস্থ্য ও রক্তচাপ", desc: "রক্তচাপ স্বাভাবিক এবং শরীরে কোনো সংক্রামক রোগ (হেপাটাইটিস, ম্যালেরিয়া, এইডস) থাকা যাবে না।" },
      ]
    : [
        { title: "Age & Weight", desc: "Must be aged between 18–60 years and weigh at least 45–50 kg." },
        { title: "Donation Interval", desc: "At least 120 days (4 months) must have passed since the last blood donation." },
        { title: "Hemoglobin Level", desc: "Hemoglobin level must be at least 12.5 g/dL." },
        { title: "Good General Health", desc: "Normal blood pressure, no infectious disease (Hepatitis, Malaria, HIV)." },
      ];

  const faqs = isBn
    ? [
        { q: "রক্ত দিলে কি শরীর দুর্বল বা অসুস্থ হয়ে পড়ে?", a: "না। রক্তদানের পর শরীর মাত্র ২৪–৪৮ ঘণ্টার মধ্যেই রক্তের তরল অংশ পূরণ করে ফেলে এবং কয়েক সপ্তাহের মধ্যে রক্তকণিকা সম্পূর্ণ পুনরুজ্জীবিত হয়।" },
        { q: "এক ব্যাগ রক্ত দিয়ে কতজনের জীবন বাঁচানো যায়?", a: "এক ব্যাগ রক্ত থেকে লোহিত রক্তকণিকা, প্লাটিলেট ও প্লাজমা আলাদা করে সর্বোচ্চ ৩ জন মুমূর্ষু রোগীর জীবন রক্ষা করা সম্ভব।" },
        { q: "রক্তদানের পূর্বে কী করণীয়?", a: "রক্তদানের আগে প্রচুর পানি পান করুন, পুষ্টিকর খাবার খান এবং আগের রাতে অন্তত ৭-৮ ঘণ্টা ভালো ঘুম নিশ্চিত করুন।" },
        { q: "রক্তদানের পর কী করণীয়?", a: "রক্তদানের পর ১০-১৫ মিনিট বিশ্রাম নিন, প্রচুর পানি ও ফলের রস পান করুন এবং ভারী ব্যায়াম থেকে বিরত থাকুন।" },
      ]
    : [
        { q: "Does blood donation make you weak or sick?", a: "No. The body naturally replaces lost blood fluid within 24-48 hours and regenerates healthy blood cells within a few weeks." },
        { q: "How many lives can one donation save?", a: "One single donation can be separated into red cells, platelets, and plasma to help save up to 3 patients' lives." },
        { q: "What should I do before donating blood?", a: "Drink plenty of fluids, have a wholesome healthy meal, and get at least 7-8 hours of sleep the night before." },
        { q: "What should I do after donation?", a: "Rest for 10-15 minutes, drink hydrating liquids and fruit juice, and avoid heavy lifting for the rest of the day." },
      ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12" id="guidelines-page-root">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white rounded-3xl p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-rose-100">
            <BookOpen size={13} />
            <span>{isBn ? "রক্তদান নির্দেশিকা ও তথ্যভাণ্ডার" : "Blood Donation Guidelines & Knowledge"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {isBn ? "জীবন বাঁচাতে রক্ত দিন: জানুন সঠিক নিয়ম ও নির্দেশিকা" : "Donate Blood, Save Lives: Complete Guidelines"}
          </h1>
          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            {isBn
              ? "রক্তদান সম্পূর্ণ নিরাপদ ও মানবিক কাজ। আপনার সামান্য রক্তদানে ফিরে পেতে পারে কোনো মুমূর্ষু মানুষের নতুন জীবন।"
              : "Donating blood is safe, noble, and saves precious lives. Learn the rules, compatibility, and health benefits."}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onNavigateToSearch}
              className="px-5 py-2.5 bg-white text-rose-700 font-bold text-sm rounded-xl hover:bg-rose-50 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Droplet size={16} className="text-rose-600" />
              <span>{isBn ? "রক্তদাতা খুঁজুন" : "Find Donors"}</span>
            </button>
            <button
              onClick={onNavigateToRequest}
              className="px-5 py-2.5 bg-rose-900/40 hover:bg-rose-900/60 border border-white/30 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Heart size={16} />
              <span>{isBn ? "রক্তের আবেদন পোস্ট করুন" : "Post Blood Request"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. Eligibility Criteria */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <UserCheck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isBn ? "কারা রক্ত দিতে পারবেন?" : "Who Can Donate Blood?"}
            </h2>
            <p className="text-xs text-gray-500">
              {isBn ? "রক্তদানের পূর্বে জেনে নিন প্রাথমিক শারীরিক যোগ্যতা" : "Basic eligibility criteria before donation"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {eligibilityRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:border-red-100 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  ✓
                </div>
                <h3 className="font-bold text-gray-900 text-base">{rule.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Blood Group Compatibility Matrix */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <Droplet size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isBn ? "রক্তের গ্রুপ মেলানোর ছক (Compatibility Matrix)" : "Blood Group Compatibility Matrix"}
            </h2>
            <p className="text-xs text-gray-500">
              {isBn ? "কোন গ্রুপের রক্ত কাকে দেওয়া যাবে এবং কার থেকে নেওয়া যাবে" : "Which blood group can give to or receive from"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-xs">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-gray-700 border-b border-gray-200 text-xs uppercase font-bold tracking-wider">
                <th className="p-4 px-6">{isBn ? "রক্তের গ্রুপ" : "Blood Group"}</th>
                <th className="p-4 px-6">{isBn ? "যাদের রক্ত দিতে পারবে" : "Can Donate To"}</th>
                <th className="p-4 px-6">{isBn ? "যাদের থেকে রক্ত নিতে পারবে" : "Can Receive From"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bloodCompatibility.map((item, i) => (
                <tr key={i} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-4 px-6 font-black text-red-600 text-base">
                    <span className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100 font-extrabold">
                      {item.group}
                    </span>
                  </td>
                  <td className="p-4 px-6 font-semibold text-gray-800">
                    <div className="flex flex-wrap gap-1.5">
                      {item.canGiveTo.map((g, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 px-6 font-semibold text-gray-800">
                    <div className="flex flex-wrap gap-1.5">
                      {item.canReceiveFrom.map((g, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs rounded-md font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-gray-200 pb-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-xl">
            <HelpCircle size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isBn ? "সাধারণ জিজ্ঞাসা ও উত্তর (FAQ)" : "Frequently Asked Questions"}
            </h2>
            <p className="text-xs text-gray-500">
              {isBn ? "রক্তদান সম্পর্কিত বহুল জিজ্ঞাসিত প্রশ্ন" : "Common questions about blood donation"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-start gap-2">
                <span className="text-rose-600 font-extrabold">Q.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
