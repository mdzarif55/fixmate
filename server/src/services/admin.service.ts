import { ObjectId, type Filter } from "mongodb";
import {
  bookingsCollection,
  paymentsCollection,
  servicesCollection,
  usersCollection,
} from "../database/mongo.js";
import type { BookingDoc, ServiceDoc } from "../types/index.js";
import {
  APPROVAL_STATUSES,
  BOOKING_STATUSES,
  SERVICE_CATEGORIES,
  type ApprovalStatus,
  type BookingStatus,
  type UserRole,
} from "../utils/constants.js";
import { AppError } from "../utils/responses.js";

export async function getAdminOverview() {
  const [users, services, bookings, payments] = await Promise.all([
    usersCollection().find().toArray(),
    servicesCollection().find().toArray(),
    bookingsCollection().find().toArray(),
    paymentsCollection().find().sort({ paidAt: -1 }).toArray(),
  ]);

  const totalUsers = users.length;
  const totalTechnicians = users.filter((u) => u.role === "technician").length;
  const pendingServices = services.filter(
    (s) => s.approvalStatus === "pending"
  ).length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const bookingsByStatus = BOOKING_STATUSES.map((status) => ({
    status,
    count: bookings.filter((b) => b.status === status).length,
  }));

  const servicesByCategory = SERVICE_CATEGORIES.map((category) => ({
    category,
    services: services.filter((s) => s.category === category).length,
    bookings: bookings.filter((b) => b.category === category).length,
  }));

  return {
    stats: {
      totalUsers,
      totalTechnicians,
      pendingServices,
      totalServices: services.length,
      totalBookings: bookings.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    },
    charts: {
      bookingsByStatus,
      servicesByCategory,
    },
    recentBookings: bookings
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5),
    recentPayments: payments.slice(0, 5),
  };
}

export async function listAllUsers() {
  return usersCollection()
    .find(
      {},
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          role: 1,
          phone: 1,
          area: 1,
          plan: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1 })
    .toArray();
}

export async function updateUserRole(
  targetId: string,
  role: UserRole,
  currentAdminId: string,
  currentAdminEmail: string
) {
  const users = usersCollection();
  let targetUser = null;

  if (ObjectId.isValid(targetId)) {
    targetUser = await users.findOne({ _id: new ObjectId(targetId) });
  }
  if (!targetUser) {
    targetUser = await users.findOne({ _id: targetId as unknown as ObjectId });
  }

  if (!targetUser) {
    throw new AppError("User not found.", 404);
  }

  if (
    String(targetUser._id) === currentAdminId ||
    targetUser.email === currentAdminEmail
  ) {
    throw new AppError("Admins cannot change their own role.", 400);
  }

  await users.updateOne(
    { _id: targetUser._id },
    { $set: { role, updatedAt: new Date() } }
  );

  return users.findOne(
    { _id: targetUser._id },
    {
      projection: {
        name: 1,
        email: 1,
        image: 1,
        role: 1,
        phone: 1,
        area: 1,
        plan: 1,
        createdAt: 1,
      },
    }
  );
}

export async function listAdminServices(approvalFilter?: string) {
  const filter: Filter<ServiceDoc> = {};
  if (
    approvalFilter &&
    approvalFilter !== "all" &&
    (APPROVAL_STATUSES as readonly string[]).includes(approvalFilter)
  ) {
    filter.approvalStatus = approvalFilter as ApprovalStatus;
  }

  const services = await servicesCollection()
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  // Prioritize pending services first when showing all
  const priorityOrder: Record<string, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };
  services.sort(
    (a, b) =>
      (priorityOrder[a.approvalStatus] ?? 3) -
      (priorityOrder[b.approvalStatus] ?? 3)
  );

  return services;
}

export async function updateServiceApproval(
  serviceId: string,
  approvalStatus: "approved" | "rejected"
) {
  if (!ObjectId.isValid(serviceId)) {
    throw new AppError("Invalid service ID.", 400);
  }

  const col = servicesCollection();
  const service = await col.findOne({ _id: new ObjectId(serviceId) });
  if (!service) {
    throw new AppError("Service not found.", 404);
  }

  await col.updateOne(
    { _id: service._id },
    { $set: { approvalStatus, updatedAt: new Date() } }
  );

  return col.findOne({ _id: service._id });
}

export async function listAdminBookings(statusFilter?: string) {
  const filter: Filter<BookingDoc> = {};
  if (
    statusFilter &&
    statusFilter !== "all" &&
    (BOOKING_STATUSES as readonly string[]).includes(statusFilter)
  ) {
    filter.status = statusFilter as BookingStatus;
  }

  return bookingsCollection().find(filter).sort({ createdAt: -1 }).toArray();
}

export async function listAdminPayments() {
  const payments = await paymentsCollection()
    .find()
    .sort({ paidAt: -1 })
    .toArray();

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return {
    payments,
    totalRevenue: Number(totalRevenue.toFixed(2)),
  };
}
