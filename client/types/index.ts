import type {
  ApprovalStatus,
  BookingStatus,
  PaymentStatus,
  ServiceCategory,
  ServiceMode,
  UserRole,
} from "@/lib/constants";

export interface UserProfile {
  _id: string;
  id?: string;
  name: string;
  email: string;
  image?: string | null;
  role: UserRole;
  phone?: string;
  area?: string;
  bio?: string;
  plan?: "free" | "pro";
  createdAt: string;
}

export interface ServiceItem {
  _id: string;
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
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceDetailsResponse {
  service: ServiceItem;
  technician: {
    name: string;
    email: string;
    image?: string | null;
    area?: string;
    bio?: string;
    plan?: "free" | "pro";
  } | null;
  reviews: Array<{
    _id: string;
    customerName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export interface BookingStatusHistoryItem {
  status: string;
  changedAt: string;
}

export interface BookingReview {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface BookingItem {
  _id: string;
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
  statusHistory?: BookingStatusHistoryItem[];
  review?: BookingReview | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  _id: string;
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
  paidAt: string;
}

export interface PaginatedServicesResponse {
  services: ServiceItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
