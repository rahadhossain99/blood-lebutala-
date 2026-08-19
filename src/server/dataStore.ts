import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, Appointment, BloodGroup } from "../types";

const DB_FILE = path.join(process.cwd(), "db.json");

interface Database {
  users: Record<string, User & { passwordHash: string }>;
  appointments: Appointment[];
  bloodStock: Record<BloodGroup, number>;
}

// Complete initial seed data of diverse donors across Bangladesh
const DEFAULT_STOCK: Record<BloodGroup, number> = {
  "A+": 18,
  "A-": 4,
  "B+": 25,
  "B-": 3,
  "AB+": 9,
  "AB-": 2,
  "O+": 32,
  "O-": 7,
};

const SEED_USERS = [
  {
    name: "মেহেদী হাসান রাহাত",
    email: "rahad@gmail.com",
    phone: "01712345678",
    password: "password123",
    bloodGroup: "A+" as BloodGroup,
    district: "Dhaka (ঢাকা)",
    isAvailable: true,
    lastDonationDate: "2026-03-15",
    role: "admin" as const,
  },
  {
    name: "জান্নাতুল ফেরদৌস",
    email: "jannat@gmail.com",
    phone: "01811122233",
    password: "password123",
    bloodGroup: "O+" as BloodGroup,
    district: "Chittagong (চট্টগ্রাম)",
    isAvailable: true,
    lastDonationDate: "2026-01-10",
    role: "donor" as const,
  },
  {
    name: "আরিফুর রহমান",
    email: "arif@gmail.com",
    phone: "01933344455",
    password: "password123",
    bloodGroup: "B+" as BloodGroup,
    district: "Sylhet (সিলেট)",
    isAvailable: true,
    lastDonationDate: "2026-05-02",
    role: "donor" as const,
  },
  {
    name: "সাদিয়া ইসলাম",
    email: "sadia@gmail.com",
    phone: "01544455566",
    password: "password123",
    bloodGroup: "A-" as BloodGroup,
    district: "Dhaka (ঢাকা)",
    isAvailable: false,
    lastDonationDate: "2026-05-20",
    role: "donor" as const,
  },
  {
    name: "মো: তানভীর হোসেন",
    email: "tanvir@gmail.com",
    phone: "01355566677",
    password: "password123",
    bloodGroup: "O-" as BloodGroup,
    district: "Khulna (খুলনা)",
    isAvailable: true,
    lastDonationDate: "2025-11-20",
    role: "donor" as const,
  },
  {
    name: "তাসনিম জাহান লিজা",
    email: "liza@gmail.com",
    phone: "01677788899",
    password: "password123",
    bloodGroup: "AB+" as BloodGroup,
    district: "Rajshahi (রাজশাহী)",
    isAvailable: true,
    lastDonationDate: "2026-04-01",
    role: "donor" as const,
  },
  {
    name: "ইমরান চৌধুরী",
    email: "imran@gmail.com",
    phone: "01799988877",
    password: "password123",
    bloodGroup: "B-" as BloodGroup,
    district: "Mymensingh (ময়মনসিংহ)",
    isAvailable: true,
    lastDonationDate: "2026-02-12",
    role: "donor" as const,
  },
  {
    name: "সায়মন আহমেদ",
    email: "saymon@gmail.com",
    phone: "01822334455",
    password: "password123",
    bloodGroup: "AB-" as BloodGroup,
    district: "Barisal (বরিশাল)",
    isAvailable: true,
    lastDonationDate: "2026-05-18",
    role: "donor" as const,
  },
  {
    name: "সুমাইয়া সুলতানা",
    email: "sumaiya@gmail.com",
    phone: "01988776655",
    password: "password123",
    bloodGroup: "A+" as BloodGroup,
    district: "Rangpur (রংপুর)",
    isAvailable: true,
    lastDonationDate: "2026-02-28",
    role: "donor" as const,
  },
  {
    name: "মো: রিয়াদ মাহমুদ",
    email: "riyad@gmail.com",
    phone: "01755667788",
    password: "password123",
    bloodGroup: "O+" as BloodGroup,
    district: "Dhaka (ঢাকা)",
    isAvailable: true,
    lastDonationDate: "2025-08-15",
    role: "donor" as const,
  }
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: "app-1",
    patientName: "রফিকুল ইসলাম (ডেঙ্গু রোগী)",
    bloodGroup: "A+",
    hospitalName: "ঢাকা মেডিকেল কলেজ হাসপাতাল",
    contactPhone: "01700998877",
    date: "2026-06-12",
    time: "10:30",
    status: "approved",
    type: "request",
    unitsRequested: 2,
    remarks: "জরুরী হিমোগ্লোবিন কমে যাওয়ার কারণে রক্ত প্রয়োজন।",
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "app-2",
    donorId: "user-2", // will map to realistic user ids
    donorName: "জান্নাতুল ফেরদৌস",
    bloodGroup: "O+",
    hospitalName: "চট্টগ্রাম ইম্পেরিয়াল হাসপাতাল",
    contactPhone: "01811122233",
    date: "2026-06-15",
    time: "11:00",
    status: "pending",
    type: "donate",
    remarks: "রপ্তিদাতা স্বেচ্ছায় দান করতে ইচ্ছুক।",
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "app-3",
    patientName: "সামসুদ্দিন আহমেদ",
    bloodGroup: "AB-",
    hospitalName: "সিলেট এম এ জি ওসমানী মেডিকেল কলেজ",
    contactPhone: "01944556677",
    date: "2026-06-08",
    time: "14:00",
    status: "completed",
    type: "request",
    unitsRequested: 1,
    remarks: "একটি সফল দান সম্পন্ন হয়েছে। ধন্যবাদ রক্তদাতাকে।",
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  }
];

export class DataStore {
  private memoryDb: Database;

  constructor() {
    this.memoryDb = {
      users: {},
      appointments: [],
      bloodStock: { ...DEFAULT_STOCK },
    };
    this.initDatabase();
  }

  private initDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8").trim();
        if (fileContent.length > 0) {
          const parsed = JSON.parse(fileContent);
          if (parsed && typeof parsed === "object") {
            this.memoryDb = {
              users: parsed.users || {},
              appointments: Array.isArray(parsed.appointments) ? parsed.appointments : [],
              bloodStock: { ...DEFAULT_STOCK, ...(parsed.bloodStock || {}) },
            };

            // If users table is empty in db.json, seed with initial demo users
            if (Object.keys(this.memoryDb.users).length === 0) {
              this.seedInitialData();
            } else {
              console.log("Database successfully loaded from storage");
            }
            return;
          }
        }
      }
      console.log("Database file doesn't exist or is invalid. Creating and seeding...");
      this.seedInitialData();
    } catch (error) {
      console.error("Failed to initialize database, falling back to seed", error);
      this.seedInitialData();
    }
  }

  private save() {
    try {
      const data = JSON.stringify(this.memoryDb, null, 2);
      fs.writeFileSync(DB_FILE, data, "utf-8");
    } catch (error) {
      console.error("Failed to persist database changes to file:", error);
    }
  }

  private seedInitialData() {
    const users: Record<string, User & { passwordHash: string }> = {};

    SEED_USERS.forEach((sUser, idx) => {
      const id = `user-${idx + 1}`;
      const salt = bcrypt.genSaltSync(8);
      const passwordHash = bcrypt.hashSync(sUser.password, salt);

      const userInstance: User = {
        id,
        name: sUser.name,
        email: sUser.email,
        phone: sUser.phone,
        bloodGroup: sUser.bloodGroup,
        district: sUser.district,
        isAvailable: sUser.isAvailable,
        lastDonationDate: sUser.lastDonationDate,
        createdAt: new Date().toISOString(),
        role: sUser.role,
      };

      users[id] = {
        ...userInstance,
        passwordHash,
      };
    });

    this.memoryDb = {
      users,
      appointments: SEED_APPOINTMENTS,
      bloodStock: { ...DEFAULT_STOCK },
    };

    this.save();
    console.log("Seeding complete with standard local donors and system statistics.");
  }

  // GET ALL DONORS
  public getAllDonors(): User[] {
    return Object.values(this.memoryDb.users).map(({ passwordHash, ...rest }) => rest);
  }

  // GET DONOR BY ID
  public getUserById(id: string): User | null {
    const match = this.memoryDb.users[id];
    if (!match) return null;
    const { passwordHash, ...safeUser } = match;
    return safeUser;
  }

  // REGISTER USER
  public registerUser(u: Omit<User, 'id' | 'createdAt'>, passwordPlain: string): User {
    const existing = Object.values(this.memoryDb.users).find(
      (existingUser) => existingUser.email === u.email || existingUser.phone === u.phone
    );
    if (existing) {
      throw new Error("এই ইমেইল বা মোবাইল নাম্বারটি ইতিপূর্বে ব্যবহার করা হয়েছে।");
    }

    const id = `user-${Date.now()}`;
    const salt = bcrypt.genSaltSync(8);
    const passwordHash = bcrypt.hashSync(passwordPlain, salt);

    const newUser: User = {
      ...u,
      id,
      createdAt: new Date().toISOString(),
    };

    this.memoryDb.users[id] = {
      ...newUser,
      passwordHash,
    };

    this.save();
    return newUser;
  }

  // VALIDATE LOGIN
  public validateLogin(credential: string, passwordPlain: string): User {
    const userMatch = Object.values(this.memoryDb.users).find(
      (user) => user.email === credential || user.phone === credential
    );

    if (!userMatch) {
      throw new Error("আপনার ইমেইল/ফোন অথবা পাসওয়ার্ড ভুল হয়েছে।");
    }

    const isValid = bcrypt.compareSync(passwordPlain, userMatch.passwordHash);
    if (!isValid) {
      throw new Error("আপনার ইমেইল/ফোন অথবা পাসওয়ার্ড ভুল হয়েছে।");
    }

    const { passwordHash, ...safeUser } = userMatch;
    return safeUser;
  }

  // UPDATE USER PROFILE
  public updateUserProfile(id: string, updates: Partial<Omit<User, 'id' | 'role' | 'createdAt'>>): User {
    const userMatch = this.memoryDb.users[id];
    if (!userMatch) {
      throw new Error("ব্যবহারকারী পাওয়া যায়নি।");
    }

    this.memoryDb.users[id] = {
      ...userMatch,
      ...updates,
    };

    this.save();
    const { passwordHash, ...safeUser } = this.memoryDb.users[id];
    return safeUser;
  }

  // GET APPOINTMENTS
  public getAppointments(): Appointment[] {
    return this.memoryDb.appointments;
  }

  // CREATE APPOINTMENT
  public createAppointment(app: Omit<Appointment, 'id' | 'createdAt'>): Appointment {
    const id = `app-${Date.now()}`;
    const newApp: Appointment = {
      ...app,
      id,
      createdAt: new Date().toISOString(),
    };

    this.memoryDb.appointments.unshift(newApp);

    // If a request of blood status is 'completed' or a donation is 'completed', let's adjust the blood inventory stock!
    if (newApp.status === "completed") {
      this.adjustStock(newApp.bloodGroup, newApp.type === "donate" ? 1 : -(newApp.unitsRequested || 1));
    }

    this.save();
    return newApp;
  }

  // UPDATE APPOINTMENT STATUS
  public updateAppointmentStatus(id: string, status: Appointment["status"]): Appointment {
    const appIndex = this.memoryDb.appointments.findIndex((a) => a.id === id);
    if (appIndex === -1) {
      throw new Error("অ্যাপয়েন্টমেন্ট পাওয়া যায়নি।");
    }

    const oldApp = this.memoryDb.appointments[appIndex];
    const updatedApp = { ...oldApp, status };

    // Trigger stock adjustments if the transition is to 'completed'
    if (status === "completed" && oldApp.status !== "completed") {
      const adjustmentUnits = updatedApp.type === "donate" ? 1 : -(updatedApp.unitsRequested || 1);
      this.adjustStock(updatedApp.bloodGroup, adjustmentUnits);
    }
    // Revert stock adjustments if transitions from 'completed' to others
    else if (status !== "completed" && oldApp.status === "completed") {
      const adjustmentUnits = oldApp.type === "donate" ? -1 : +(oldApp.unitsRequested || 1);
      this.adjustStock(oldApp.bloodGroup, adjustmentUnits);
    }

    this.memoryDb.appointments[appIndex] = updatedApp;
    this.save();
    return updatedApp;
  }

  // GET INVENTORY STOCK
  public getBloodStock(): Record<BloodGroup, number> {
    return this.memoryDb.bloodStock;
  }

  // ADJUST BLOOD STOCK UNITS (DASHBOARD-STOCKS CRUD SIMULATING)
  public adjustStock(group: BloodGroup, units: number) {
    const current = this.memoryDb.bloodStock[group] || 0;
    this.memoryDb.bloodStock[group] = Math.max(0, current + units);
    this.save();
  }

  // UPDATE ENTIRE BLOOD STOCK (ADMIN FEATURE)
  public updateBloodStocks(stocks: Record<BloodGroup, number>) {
    this.memoryDb.bloodStock = { ...stocks };
    this.save();
  }
}

export const dbInstance = new DataStore();
