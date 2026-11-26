export const SERVICE_CATEGORIES = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export const SERVICE_MODES = ["Home Visit", "Shop Drop-off"] as const;
export type ServiceMode = (typeof SERVICE_MODES)[number];

export const APPROVAL_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const BOOKING_STATUSES = [
  "requested",
  "accepted",
  "rejected",
  "in-progress",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "requested",
  "accepted",
  "in-progress",
];

export const ALLOWED_TECHNICIAN_TRANSITIONS: Record<
  string,
  readonly BookingStatus[]
> = {
  requested: ["accepted", "rejected"],
  accepted: ["in-progress"],
  "in-progress": ["completed"],
};

export const PAYMENT_STATUSES = ["unpaid", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const USER_ROLES = ["customer", "technician", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const FREE_TECHNICIAN_SERVICE_LIMIT = 3;
export const PRO_PLAN_PRICE_USD = 50;
