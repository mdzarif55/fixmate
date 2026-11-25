import type { ObjectId } from "mongodb";
import type {
  ApprovalStatus,
  BookingStatus,
  PaymentStatus,
  ServiceCategory,
  ServiceMode,
  UserRole,
} from "../utils/constants.js";

export interface UserDoc {
  _id: ObjectId | string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  role: UserRole;
  phone?: string;
  area?: string;
  bio?: string;
  plan?: "free" | "pro";
  createdAt: Date;
  updatedAt?: Date;
}

export interface ServiceDoc {
  _id: ObjectId;
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  technicianIsPro?: boolean;
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  ratingAverage?: number;
  reviewCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface BookingStatusHistoryEntry {
  status: string;
  changedAt: Date;
}

export interface BookingReviewEntry {
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface BookingDoc {
  _id: ObjectId;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  category: string;
  basePrice: number;
  technicianName: string;
  technicianEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  preferredDate: string;
  problemDescription: string;
  status: BookingStatus;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  statusHistory: BookingStatusHistoryEntry[];
  review?: BookingReviewEntry | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDoc {
  _id: ObjectId;
  bookingId: string;
  serviceTitle: string;
  customerName: string;
  customerEmail: string;
  technicianName: string;
  technicianEmail: string;
  amount: number;
  currency: "USD";
  transactionId: string;
  stripeSessionId: string;
  paymentStatus: "paid";
  paidAt: Date;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  phone?: string;
  area?: string;
  bio?: string;
  plan?: "free" | "pro";
}
