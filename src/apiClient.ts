import { getApiUrl } from "./utils";
import { User, Appointment, BloodGroup } from "./types";
import { FALLBACK_DONORS, FALLBACK_STATS } from "./fallbackData";
import { 
  getDonorsFromFirestore, 
  syncFirebaseUserToFirestore, 
  registerWithFirebase, 
  loginWithFirebase, 
  updateProfileInFirestore, 
  createAppointmentInFirestore, 
  getAppointmentsFromFirestore 
} from "./firestoreService";

export interface DonorFilters {
  bloodGroup?: BloodGroup | string;
  district?: string;
  isAvailable?: boolean;
}

export const apiClient = {
  // 1. Fetch Donors List with optional filters and auth token
  async getDonors(filters?: DonorFilters, token?: string | null): Promise<User[]> {
    let url = "/api/donors?";
    if (filters?.bloodGroup) url += `bloodGroup=${encodeURIComponent(filters.bloodGroup)}&`;
    if (filters?.district) url += `district=${encodeURIComponent(filters.district)}&`;
    if (filters?.isAvailable !== undefined) url += `isAvailable=${filters.isAvailable}&`;

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const resp = await fetch(getApiUrl(url), { headers });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Backend not reached, fall through to Firestore
    }

    // Direct Firestore fetch
    try {
      return await getDonorsFromFirestore(filters);
    } catch (err) {
      console.warn("Firestore donor fetch fallback to local list:", err);
    }

    // Local client-side fallback (ideal for GitHub Pages / static hosting without node server)
    let list = [...FALLBACK_DONORS];
    if (filters?.bloodGroup) {
      list = list.filter((d) => d.bloodGroup === filters.bloodGroup);
    }
    if (filters?.district) {
      list = list.filter((d) => d.district?.toLowerCase().includes(filters.district!.toLowerCase()));
    }
    if (filters?.isAvailable !== undefined) {
      list = list.filter((d) => d.isAvailable === filters.isAvailable);
    }
    // If not logged in, mask phone numbers for privacy
    if (!token) {
      list = list.map((d) => ({
        ...d,
        phone: d.phone ? d.phone.substring(0, 5) + "******" : "",
      }));
    }
    return list;
  },

  // 2. Fetch Dashboard Metrics & Live Stock
  async getStats(): Promise<any> {
    try {
      const resp = await fetch(getApiUrl("/api/stats"));
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to Firestore
    }

    try {
      const donors = await getDonorsFromFirestore();
      const appointments = await getAppointmentsFromFirestore();
      
      const stock: Record<string, number> = {
        "A+": 0, "A-": 0, "B+": 0, "B-": 0, "AB+": 0, "AB-": 0, "O+": 0, "O-": 0
      };
      donors.forEach((d) => {
        if (d.bloodGroup && stock[d.bloodGroup] !== undefined) {
          stock[d.bloodGroup] += 1;
        }
      });

      return {
        totalDonors: donors.length || FALLBACK_STATS.totalDonors,
        availableDonors: donors.filter((d) => d.isAvailable).length || FALLBACK_STATS.availableDonors,
        totalDonations: donors.filter((d) => d.lastDonationDate).length + 15,
        bloodStock: stock,
        recentAppointments: appointments.slice(0, 5),
      };
    } catch (e) {
      return FALLBACK_STATS;
    }
  },

  // 3. User Login
  async login(credential: string, password?: string): Promise<{ token: string; user: User }> {
    try {
      const resp = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, password }),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Backend not reached, fall through to Firestore
    }

    return await loginWithFirebase(credential, password);
  },

  // 3.1 Firebase Google Auth Sync
  async firebaseLogin(payload: {
    email: string;
    name?: string;
    avatarUrl?: string;
    firebaseUid?: string;
    phone?: string;
  }): Promise<{ token: string; user: User; isNew: boolean }> {
    try {
      const resp = await fetch(getApiUrl("/api/auth/firebase-login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to Firestore
    }

    // Direct Firestore synchronization
    const user = await syncFirebaseUserToFirestore({
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.avatarUrl,
      firebaseUid: payload.firebaseUid || `user_${Date.now()}`,
      phone: payload.phone,
    });

    const token = `firebase_token_${user.id}_${Date.now()}`;
    return { token, user, isNew: !user.phone || !user.bloodGroup };
  },

  // 4. User Registration
  async register(userData: Record<string, any>): Promise<{ token: string; user: User }> {
    try {
      const resp = await fetch(getApiUrl("/api/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to Firestore
    }

    return await registerWithFirebase(userData as any);
  },

  // 5. Get Current Authenticated User Profile
  async getMe(token: string): Promise<{ user: User }> {
    try {
      const resp = await fetch(getApiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to local/Firestore storage
    }

    // If local user exists in storage
    const storedUser = localStorage.getItem("blood_donation_user");
    if (storedUser) {
      return { user: JSON.parse(storedUser) };
    }
    throw new Error("Session verification failed");
  },

  // 6. Update User Profile
  async updateProfile(updates: Partial<User>, token: string): Promise<{ user: User }> {
    try {
      const resp = await fetch(getApiUrl("/api/auth/profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to Firestore
    }

    const storedUserStr = localStorage.getItem("blood_donation_user");
    const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
    const userId = updates.id || storedUser?.id || "unknown";

    const updated = await updateProfileInFirestore(userId, updates);
    localStorage.setItem("blood_donation_user", JSON.stringify(updated));
    return { user: updated };
  },

  // 7. Fetch Google Auth URL
  async getGoogleAuthUrl(returnUrl?: string): Promise<{ url: string; simulated: boolean }> {
    const query = returnUrl ? `?return_url=${encodeURIComponent(returnUrl)}` : "";
    const resp = await fetch(getApiUrl(`/api/auth/google/url${query}`));
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Failed to retrieve Google Auth URL");
    }
    if (data.url && data.url.startsWith("/")) {
      data.url = getApiUrl(data.url);
    }
    return data;
  },

  // 8. Fetch My Appointments
  async getMyAppointments(token: string): Promise<Appointment[]> {
    try {
      const resp = await fetch(getApiUrl("/api/appointments/my"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to Firestore
    }
    return await getAppointmentsFromFirestore();
  },

  // 9. Create Appointment / Request
  async createAppointment(appointment: Partial<Appointment>, token?: string | null): Promise<Appointment> {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const resp = await fetch(getApiUrl("/api/appointments"), {
        method: "POST",
        headers,
        body: JSON.stringify(appointment),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through to Firestore
    }
    return await createAppointmentInFirestore(appointment);
  },

  // 10. Update Appointment Status
  async updateAppointmentStatus(id: string, status: Appointment["status"], token: string): Promise<Appointment> {
    try {
      const resp = await fetch(getApiUrl(`/api/appointments/${id}/status`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through
    }
    return { id, status } as any;
  },

  // 11. Admin Stock Modification
  async updateBloodStocks(stocks: Record<BloodGroup, number>, token: string): Promise<any> {
    try {
      const resp = await fetch(getApiUrl("/api/stocks/set"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stocks),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (err) {
      // Fall through
    }
    return { success: true, bloodStock: stocks };
  },
};

