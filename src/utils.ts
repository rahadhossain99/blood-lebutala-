import { BloodGroup } from "./types";

// Standard Districts of Bangladesh
export const BANGLADESH_DISTRICTS = [
  "Lebutala, Jashore (লেবুতলা, যশোর)",
  "Jashore (যশোর)",
  "Dhaka (ঢাকা)",
  "Chittagong (চট্টগ্রাম)",
  "Sylhet (সিলেট)",
  "Khulna (খুলনা)",
  "Rajshahi (রাজশাহী)",
  "Barisal (বরিশাল)",
  "Rangpur (রংপুর)",
  "Mymensingh (ময়মনসিংহ)",
  "Cumilla (কুমিল্লা)",
  "Noakhali (নোয়াখালী)",
  "Cox's Bazar (কক্সবাজার)",
  "Bogura (বগুড়া)",
  "Kushtia (কুষ্টিয়া)",
  "Satkhira (সাতক্ষীরা)",
  "Magura (মাগুরা)",
  "Narail (নড়াইল)",
  "Jhenaidah (ঝিনাইদহ)",
  "Gazipur (গাজীপুর)",
  "Narayanganj (নারায়ণগঞ্জ)",
  "Faridpur (ফরিদপুর)",
  "Pabna (পাবনা)",
  "Dinajpur (দিনাজপুর)",
  "Tangail (টাঙ্গাইল)"
];

// Calculate Donor Eligibility (120 days cycle)
export function checkDonorEligibility(lastDonationDateStr?: string): { eligible: boolean; remainingDays: number; nextDateStr: string } {
  if (!lastDonationDateStr) {
    return { eligible: true, remainingDays: 0, nextDateStr: "" };
  }

  const lastDate = new Date(lastDonationDateStr);
  if (isNaN(lastDate.getTime())) {
    return { eligible: true, remainingDays: 0, nextDateStr: "" };
  }

  const nextDateVal = lastDate.getTime() + 120 * 24 * 60 * 60 * 1000;
  const nextDate = new Date(nextDateVal);
  const now = new Date();

  const diffTime = nextDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const yyyy = nextDate.getFullYear();
  const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
  const dd = String(nextDate.getDate()).padStart(2, "0");
  const nextDateStr = `${yyyy}-${mm}-${dd}`;

  if (diffTime <= 0) {
    return { eligible: true, remainingDays: 0, nextDateStr };
  }

  return { eligible: false, remainingDays, nextDateStr };
}

// Translations Directory for complete localized language switching
export const TRANSLATIONS = {
  bn: {
    appName: "রক্তদান জীবন",
    appSubTitle: "জীবন বাঁচাতে রক্ত দিন, মানবতায় হাত বাড়ান",
    home: "হোম পেজ",
    findDonor: "দাতা খুঁজুন",
    dashboard: "রক্ত ব্যাংক ড্যাশবোর্ড",
    appointments: "সব বুকিং ও আবেদন",
    guidelines: "নির্দেশিকা ও তথ্য",
    myAppointments: "আমার অ্যাপয়েন্টমেন্ট",
    login: "লগইন করুন",
    register: "নিবন্ধন করুন",
    logout: "লগ-আউট",
    donorAvailable: "উপলব্ধ দাতা",
    bloodGroup: "রক্তের গ্রুপ",
    district: "জেলা নির্বাচন করুন",
    allDistricts: "সব জেলা",
    searchPlaceholder: "জেলা অনুযায়ী খুঁজুন...",
    welcome: "স্বাগতম",
    beADonor: "রক্তদাতা হোন",
    urgentBloodNeeded: "রক্ত প্রয়োজন?",
    donateBlood: "রক্ত দান করুন",
    statsTitle: "রক্ত ব্যাংক ওভারভিউ",
    totalDonors: "মোট রক্তদাতা",
    availableDonors: "বর্তমানে প্রস্তুত",
    successfulDonors: "সফল দান সম্পন্ন",
    recentDonations: "সাম্প্রতিক রক্তের চাহিদা ও বিবরণ",
    statusPending: "অপেক্ষমান",
    statusApproved: "অনুমোদিত",
    statusCompleted: "সম্পন্ন",
    statusCancelled: "বাতিল",
    lastDonation: "শেষ রক্ত দানের তারিখ",
    neverDonated: "কখনো রক্ত দেননি",
    eligible: "রক্তদানের জন্য প্রস্তুত",
    notEligible: "পুনরায় রক্তদানের জন্য অপেক্ষারত",
    daysRemaining: "দিন বাকি",
    eligibilityNotice: "পূর্বের রক্তদানের পর অন্তত ১২০ দিন অতিবাহিত হতে হবে।",
    contactDetails: "যোগাযোগের বিবরণ",
    phone: "মোবাইল নাম্বার",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    name: "পূর্ণ নাম",
    isAvailableToggle: "জরুরী রক্তদানের জন্য প্রস্তুত আছেন?",
    registerButton: "নিবন্ধন সম্পন্ন করুন",
    loginButton: "লগইন করুন",
    noAccount: "নতুন রক্তদাতা? অ্যাকাউন্ট তৈরি করুন",
    hasAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন",
    bookNow: "অ্যাপয়েন্টমেন্ট নিন",
    requestNow: "জরুরী চাহিদা পোস্ট করুন",
    appointmentModalTitle: "রক্তের চাহিদা বা রক্ত দানের অনুরোধ ফরম",
    typeRequest: "রক্ত লাগবে (Emergency Request)",
    typeDonate: "রক্ত দিতে চাই (Selfless Donation Appointment)",
    hospitalName: "হাসপাতাল বা ল্যাব -এর নাম ও ঠিকানা",
    patientName: "রোগীর নাম / বিবরণ",
    remarks: "অন্যান্য বিবরণ বা রোগ সম্পর্কে বিশদ লিখুন",
    units: "প্রয়োজনীয় ইউনিট সংখ্যা",
    date: "নির্ধারিত তারিখ",
    time: "নির্ধারিত সময়",
    cancel: "বাতিল",
    submit: "সাবমিট করুন",
    immediateContact: "জরুরী যোগাযোগ",
    loginRequiredNotice: "রক্তদাতার যোগাযোগের নাম্বার এবং বিস্তারিত দেখতে অনুগ্রহ করে লগইন করুন।",
    noDonorsFound: "দুঃখিত, এই গ্রুপে বা স্থানে কোনো রক্তদাতা পাওয়া যায়নি।",
    stockBags: "ব্যাগ স্টক",
    adminActions: "অ্যাডমিন অ্যাকশন",
    adjustStockTitle: "রক্তের স্টক আপডেট করুন (অ্যাডমিন)",
    updateSuccess: "সফলভাবে আপডেট করা হয়েছে!",
    successAction: "কার্যক্রম সম্পন্ন হয়েছে!",
    errorAction: "ত্রুটি দেখা দিয়েছে, পুনরায় চেষ্টা করুন।",
  },
  en: {
    appName: "BloodLife",
    appSubTitle: "Donate blood, save lives & connect with community",
    home: "Home",
    findDonor: "Find Donors",
    dashboard: "Blood Dashboard",
    appointments: "Requests & Appointments",
    guidelines: "Guidelines & FAQ",
    myAppointments: "My Appointments",
    login: "Log In",
    register: "Register Member",
    logout: "Log Out",
    donorAvailable: "Available Donor",
    bloodGroup: "Blood Group",
    district: "Select District",
    allDistricts: "All Districts",
    searchPlaceholder: "Search by district...",
    welcome: "Welcome",
    beADonor: "Become a Donor",
    urgentBloodNeeded: "Need Blood Urgently?",
    donateBlood: "Donate Blood",
    statsTitle: "Blood Bank Dynamics",
    totalDonors: "Total Donors Registered",
    availableDonors: "Ready to Donate Now",
    successfulDonors: "Successful Deliveries",
    recentDonations: "Recent Live Requests Feed",
    statusPending: "Pending",
    statusApproved: "Approved",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    lastDonation: "Last Donation Date",
    neverDonated: "Never donated before",
    eligible: "Eligible to Donate",
    notEligible: "Waiting for Recovery",
    daysRemaining: "days remaining",
    eligibilityNotice: "At least 120 days must elapse between consecutive donations.",
    contactDetails: "Contact Information",
    phone: "Phone Number",
    email: "Email Address",
    password: "Password",
    name: "Full Name",
    isAvailableToggle: "Are you ready / available to donate immediately?",
    registerButton: "Create Account",
    loginButton: "Sign In",
    noAccount: "New here? Register as a Donor",
    hasAccount: "Already registered? Sign In",
    bookNow: "Schedule Appointment",
    requestNow: "Post Blood Request",
    appointmentModalTitle: "Blood Request & Donation Schedule Form",
    typeRequest: "Need Blood (Emergency Request)",
    typeDonate: "Want to Donate (Volunteer Appointment)",
    hospitalName: "Hospital/Location Address",
    patientName: "Patient Name / Context",
    remarks: "Additional comments / diagnosis",
    units: "Units Needed (Bags)",
    date: "Scheduled Date",
    time: "Preferred Time",
    cancel: "Cancel",
    submit: "Submit",
    immediateContact: "Emergency Action",
    loginRequiredNotice: "Please Log In to unlock donor phone numbers and trigger communication.",
    noDonorsFound: "No donors found with the selected criteria.",
    stockBags: "Bags Unit",
    adminActions: "Admin Dashboard",
    adjustStockTitle: "Adjust Stock Count (Admin Portal)",
    updateSuccess: "Stock updated successfully!",
    successAction: "Action successful!",
    errorAction: "An error occurred, try again.",
  },
};

/**
 * Gets the consolidated absolute API URL dynamically.
 * If running on Netlify, it routes queries to the actual Cloud Run deployment endpoint.
 */
export function getApiUrl(endpoint: string): string {
  // Allow explicit override if provided
  const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envBase) {
    const formattedBase = envBase.replace(/\/$/, "");
    return `${formattedBase}${endpoint}`;
  }

  // Auto-detect Netlify or GitHub Pages static hosting and route to GCP Cloud Run server API
  const isExternalStatic = window.location.hostname.includes("netlify.app") || window.location.hostname.includes("github.io");
  if (isExternalStatic) {
    return `https://ais-pre-7anhgdwwlcid5d5alee2fw-53511548827.asia-southeast1.run.app${endpoint}`;
  }

  // Same-origin relative path for dev and direct previews
  return endpoint;
}
