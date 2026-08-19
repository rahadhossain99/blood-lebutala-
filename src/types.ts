/**
 * Shared Type Definitions for the Blood Donation Management System
 */

export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  district: string;
  isAvailable: boolean;
  lastDonationDate?: string; // YYYY-MM-DD format
  avatarUrl?: string; // Base64 or external photo URL
  createdAt: string;
  role: "donor" | "admin";
}

export interface DonorProfile extends Omit<User, 'password'> {
  // Publicly visible donor details
}

export interface Appointment {
  id: string;
  userId?: string; // If booked by a logged-in user
  patientName?: string;
  donorId?: string; // Selected donor ID (if specific booking)
  donorName?: string;
  bloodGroup: BloodGroup;
  hospitalName: string;
  contactPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: "pending" | "approved" | "completed" | "cancelled";
  type: "donate" | "request"; // 'donate' means user goes to donate, 'request' means user requests blood
  unitsRequested?: number;
  remarks?: string;
  createdAt: string;
}

export interface BloodStock {
  group: BloodGroup;
  units: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalDonors: number;
  availableDonors: number;
  totalDonations: number;
  bloodStock: Record<BloodGroup, number>;
  recentBookings: Appointment[];
}
