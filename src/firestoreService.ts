import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { db, auth } from "./firebase";
import { User, Appointment, BloodGroup } from "./types";
import { FALLBACK_DONORS, FALLBACK_STATS } from "./fallbackData";

const USERS_COLLECTION = "users";
const APPOINTMENTS_COLLECTION = "appointments";

// Helper to seed initial donors to Firestore if the collection is empty
export async function seedInitialFirestoreDonors(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, USERS_COLLECTION));
    if (snap.empty) {
      for (const donor of FALLBACK_DONORS) {
        await setDoc(doc(db, USERS_COLLECTION, donor.id), donor);
      }
    }
  } catch (err) {
    console.warn("Could not seed Firestore donors (offline or rule check):", err);
  }
}

// 1. Get Donors directly from Firestore
export async function getDonorsFromFirestore(filters?: {
  bloodGroup?: BloodGroup | string;
  district?: string;
  isAvailable?: boolean;
}): Promise<User[]> {
  try {
    const usersRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(usersRef);
    
    if (snap.empty) {
      // Seed initial donors if empty
      await seedInitialFirestoreDonors();
      return filterDonorsLocally(FALLBACK_DONORS, filters);
    }

    const donors: User[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as User;
      donors.push({ ...data, id: docSnap.id });
    });

    return filterDonorsLocally(donors, filters);
  } catch (err) {
    console.warn("Firestore donor fetch fallback to local data:", err);
    return filterDonorsLocally(FALLBACK_DONORS, filters);
  }
}

function filterDonorsLocally(donors: User[], filters?: {
  bloodGroup?: BloodGroup | string;
  district?: string;
  isAvailable?: boolean;
}): User[] {
  let list = [...donors];
  if (filters?.bloodGroup) {
    list = list.filter((d) => d.bloodGroup === filters.bloodGroup);
  }
  if (filters?.district) {
    list = list.filter((d) => d.district?.toLowerCase().includes(filters.district!.toLowerCase()));
  }
  if (filters?.isAvailable !== undefined) {
    list = list.filter((d) => d.isAvailable === filters.isAvailable);
  }
  return list;
}

// 2. Sync or Create User Profile in Firestore
export async function syncFirebaseUserToFirestore(payload: {
  email: string;
  name?: string;
  avatarUrl?: string;
  firebaseUid: string;
  phone?: string;
  bloodGroup?: BloodGroup;
  district?: string;
}): Promise<User> {
  const userDocRef = doc(db, USERS_COLLECTION, payload.firebaseUid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    const existing = snap.data() as User;
    const updated: Partial<User> = {};
    if (payload.avatarUrl && !existing.avatarUrl) updated.avatarUrl = payload.avatarUrl;
    if (payload.name && (!existing.name || existing.name === "Blood Donor")) updated.name = payload.name;
    
    if (Object.keys(updated).length > 0) {
      await updateDoc(userDocRef, updated);
      return { ...existing, ...updated, id: payload.firebaseUid };
    }
    return { ...existing, id: payload.firebaseUid };
  }

  // Create new user profile in Firestore
  const newUser: User = {
    id: payload.firebaseUid,
    name: payload.name || payload.email.split("@")[0] || "রক্তদাতা",
    email: payload.email.toLowerCase(),
    phone: payload.phone || "",
    bloodGroup: payload.bloodGroup || "A+",
    district: payload.district || "Lebutala, Jashore (লেবুতলা, যশোর)",
    isAvailable: true,
    lastDonationDate: "",
    avatarUrl: payload.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || "U")}&background=e11d48&color=fff`,
    role: "donor",
    createdAt: new Date().toISOString(),
  };

  await setDoc(userDocRef, newUser);
  return newUser;
}

// 3. Email & Password Register with Firebase
export async function registerWithFirebase(userData: {
  name: string;
  email: string;
  password?: string;
  phone: string;
  bloodGroup: BloodGroup;
  district: string;
  lastDonationDate?: string;
  avatarUrl?: string;
}): Promise<{ token: string; user: User }> {
  try {
    let uid = `user_${Date.now()}`;
    let token = `client_token_${Date.now()}`;

    if (userData.password && userData.email) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        uid = userCred.user.uid;
        token = await userCred.user.getIdToken();
        if (userData.name) {
          await updateFirebaseProfile(userCred.user, { displayName: userData.name });
        }
      } catch (authErr: any) {
        // If email already in use or Firebase auth fails, fallback to direct Firestore ID
        if (authErr.code === "auth/email-already-in-use") {
          throw new Error("এই ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। অনুগ্রহ করে লগইন করুন।");
        }
        console.warn("Firebase Auth create error, saving directly to Firestore:", authErr);
      }
    }

    const newUser: User = {
      id: uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      bloodGroup: userData.bloodGroup,
      district: userData.district,
      isAvailable: true,
      lastDonationDate: userData.lastDonationDate || "",
      avatarUrl: userData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=e11d48&color=fff`,
      role: "donor",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, USERS_COLLECTION, uid), newUser);
    return { token, user: newUser };
  } catch (err: any) {
    throw new Error(err.message || "রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।");
  }
}

// 4. Email & Password Login with Firebase
export async function loginWithFirebase(credential: string, password?: string): Promise<{ token: string; user: User }> {
  try {
    // If it's an email, attempt Firebase Auth sign-in
    if (credential.includes("@") && password) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, credential, password);
        const token = await userCred.user.getIdToken();
        const userSnap = await getDoc(doc(db, USERS_COLLECTION, userCred.user.uid));
        
        if (userSnap.exists()) {
          return { token, user: { ...(userSnap.data() as User), id: userCred.user.uid } };
        }

        // Auto create doc if missing
        const user = await syncFirebaseUserToFirestore({
          email: credential,
          name: userCred.user.displayName || credential.split("@")[0],
          avatarUrl: userCred.user.photoURL || undefined,
          firebaseUid: userCred.user.uid,
        });
        return { token, user };
      } catch (authErr: any) {
        if (authErr.code === "auth/user-not-found" || authErr.code === "auth/wrong-password" || authErr.code === "auth/invalid-credential") {
          throw new Error("ভুল ইমেইল বা পাসওয়ার্ড প্রদান করেছেন।");
        }
        console.warn("Firebase Auth signIn error, checking Firestore doc by email:", authErr);
      }
    }

    // Query Firestore by phone or email
    const usersRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(usersRef);
    let matchedUser: User | null = null;

    snap.forEach((docSnap) => {
      const data = docSnap.data() as User;
      if (
        (data.email && data.email.toLowerCase() === credential.toLowerCase()) ||
        (data.phone && data.phone === credential)
      ) {
        matchedUser = { ...data, id: docSnap.id };
      }
    });

    if (matchedUser) {
      const token = `token_${(matchedUser as User).id}_${Date.now()}`;
      return { token, user: matchedUser };
    }

    throw new Error("এই নম্বর বা ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন করুন।");
  } catch (err: any) {
    throw new Error(err.message || "লগইন করা সম্ভব হয়নি।");
  }
}

// 5. Update Profile in Firestore
export async function updateProfileInFirestore(userId: string, updates: Partial<User>): Promise<User> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, updates);
  const snap = await getDoc(userRef);
  return { ...(snap.data() as User), id: userId };
}

// 6. Create Appointment in Firestore
export async function createAppointmentInFirestore(appointment: Partial<Appointment>): Promise<Appointment> {
  const newAppointment: Appointment = {
    id: `app_${Date.now()}`,
    patientName: appointment.patientName || "রোগীর নাম",
    contactPhone: appointment.contactPhone || "",
    bloodGroup: appointment.bloodGroup || "A+",
    hospitalName: appointment.hospitalName || "হাসপাতাল",
    date: appointment.date || new Date().toISOString().split("T")[0],
    time: appointment.time || "10:00",
    remarks: appointment.remarks || "",
    status: "pending",
    type: appointment.type || "request",
    createdAt: new Date().toISOString(),
    ...appointment
  };

  await setDoc(doc(db, APPOINTMENTS_COLLECTION, newAppointment.id), newAppointment);
  return newAppointment;
}

// 7. Get Appointments from Firestore
export async function getAppointmentsFromFirestore(userId?: string): Promise<Appointment[]> {
  try {
    const ref = collection(db, APPOINTMENTS_COLLECTION);
    const snap = await getDocs(ref);
    const list: Appointment[] = [];
    snap.forEach((docSnap) => {
      list.push({ ...(docSnap.data() as Appointment), id: docSnap.id });
    });
    return list;
  } catch (err) {
    console.warn("Error fetching appointments from Firestore:", err);
    return [];
  }
}
