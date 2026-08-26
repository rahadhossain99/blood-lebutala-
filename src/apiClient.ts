import { getApiUrl } from "./utils";
import { User, Appointment, BloodGroup } from "./types";

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

    const resp = await fetch(getApiUrl(url), { headers });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch donors list");
    }
    return resp.json();
  },

  // 2. Fetch Dashboard Metrics & Live Stock
  async getStats(): Promise<any> {
    const resp = await fetch(getApiUrl("/api/stats"));
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch stats");
    }
    return resp.json();
  },

  // 3. User Login
  async login(credential: string, password: string): Promise<{ token: string; user: User }> {
    const resp = await fetch(getApiUrl("/api/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, password }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Login failed");
    }
    return data;
  },

  // 4. User Registration
  async register(userData: Record<string, any>): Promise<{ token: string; user: User }> {
    const resp = await fetch(getApiUrl("/api/auth/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Registration failed");
    }
    return data;
  },

  // 5. Get Current Authenticated User Profile
  async getMe(token: string): Promise<{ user: User }> {
    const resp = await fetch(getApiUrl("/api/auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Session verification failed");
    }
    return data;
  },

  // 6. Update User Profile
  async updateProfile(updates: Partial<User>, token: string): Promise<{ user: User }> {
    const resp = await fetch(getApiUrl("/api/auth/profile"), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Profile update failed");
    }
    return data;
  },

  // 7. Fetch Google Auth URL
  async getGoogleAuthUrl(): Promise<{ url: string; simulated: boolean }> {
    const resp = await fetch(getApiUrl("/api/auth/google/url"));
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Failed to retrieve Google Auth URL");
    }
    return data;
  },

  // 8. Fetch My Appointments
  async getMyAppointments(token: string): Promise<Appointment[]> {
    const resp = await fetch(getApiUrl("/api/appointments/my"), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Failed to fetch appointments");
    }
    return data;
  },

  // 9. Create Appointment / Request
  async createAppointment(appointment: Partial<Appointment>, token?: string | null): Promise<Appointment> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const resp = await fetch(getApiUrl("/api/appointments"), {
      method: "POST",
      headers,
      body: JSON.stringify(appointment),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Failed to schedule appointment");
    }
    return data;
  },

  // 10. Update Appointment Status
  async updateAppointmentStatus(id: string, status: Appointment["status"], token: string): Promise<Appointment> {
    const resp = await fetch(getApiUrl(`/api/appointments/${id}/status`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Failed to update appointment status");
    }
    return data;
  },

  // 11. Admin Stock Modification
  async updateBloodStocks(stocks: Record<BloodGroup, number>, token: string): Promise<any> {
    const resp = await fetch(getApiUrl("/api/stocks/set"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(stocks),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new Error(data.error || "Failed to update blood stocks");
    }
    return data;
  },
};
