import { ObjectId, type Filter } from "mongodb";
import { bookingsCollection, servicesCollection } from "../database/mongo.js";
import type { AuthenticatedUser, BookingDoc } from "../types/index.js";
import {
  ACTIVE_BOOKING_STATUSES,
  ALLOWED_TECHNICIAN_TRANSITIONS,
  BOOKING_STATUSES,
  type BookingStatus,
} from "../utils/constants.js";
import { AppError } from "../utils/responses.js";

export async function createBooking(
  customer: AuthenticatedUser,
  input: {
    serviceId: string;
    customerPhone: string;
    address: string;
    preferredDate: string;
    problemDescription: string;
  }
) {
  if (!ObjectId.isValid(input.serviceId)) {
    throw new AppError("Invalid service ID.", 400);
  }

  const service = await servicesCollection().findOne({
    _id: new ObjectId(input.serviceId),
    approvalStatus: "approved",
    isAvailable: true,
  });

  if (!service) {
    throw new AppError("Service not found or currently unavailable.", 404);
  }

  const bookings = bookingsCollection();
  const existingActive = await bookings.findOne({
    serviceId: input.serviceId,
    customerEmail: customer.email,
    status: { $in: ACTIVE_BOOKING_STATUSES },
  });

  if (existingActive) {
    throw new AppError(
      "You already have an active request for this service.",
      409
    );
  }

  const now = new Date();
  const doc: Omit<BookingDoc, "_id"> = {
    serviceId: String(service._id),
    serviceTitle: service.title,
    serviceImage: service.image,
    category: service.category,
    basePrice: service.basePrice,
    technicianName: service.technicianName,
    technicianEmail: service.technicianEmail,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: input.customerPhone,
    address: input.address,
    preferredDate: input.preferredDate,
    problemDescription: input.problemDescription,
    status: "requested",
    finalAmount: service.basePrice,
    paymentStatus: "unpaid",
    statusHistory: [{ status: "requested", changedAt: now }],
    review: null,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await bookings.insertOne(doc as BookingDoc);
    return { _id: result.insertedId, ...doc };
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      throw new AppError(
        "You already have an active request for this service.",
        409
      );
    }
    throw err;
  }
}

export async function listCustomerBookings(customerEmail: string) {
  const bookings = await bookingsCollection()
    .find({ customerEmail })
    .sort({ createdAt: -1 })
    .toArray();

  const totalRequests = bookings.length;
  const activeJobs = bookings.filter((b) =>
    ACTIVE_BOOKING_STATUSES.includes(b.status)
  ).length;
  const completedJobs = bookings.filter(
    (b) => b.status === "completed"
  ).length;

  return {
    bookings,
    stats: {
      totalRequests,
      activeJobs,
      completedJobs,
    },
  };
}

export async function cancelCustomerBooking(
  bookingId: string,
  customerEmail: string
) {
  if (!ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID.", 400);
  }

  const col = bookingsCollection();
  const booking = await col.findOne({ _id: new ObjectId(bookingId) });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }
  if (booking.customerEmail !== customerEmail) {
    throw new AppError(
      "Forbidden: You can only cancel your own bookings.",
      403
    );
  }
  if (booking.status !== "requested") {
    throw new AppError(
      "Only bookings in 'requested' status can be cancelled.",
      400
    );
  }

  const now = new Date();
  await col.updateOne(
    { _id: booking._id },
    {
      $set: { status: "cancelled", updatedAt: now },
      $push: { statusHistory: { status: "cancelled", changedAt: now } },
    }
  );

  return col.findOne({ _id: booking._id });
}

export async function listTechnicianBookings(
  technicianEmail: string,
  statusFilter?: string
) {
  const filter: Filter<BookingDoc> = { technicianEmail };
  if (
    statusFilter &&
    statusFilter !== "all" &&
    (BOOKING_STATUSES as readonly string[]).includes(statusFilter)
  ) {
    filter.status = statusFilter as BookingStatus;
  }

  const [bookings, pendingRequests] = await Promise.all([
    bookingsCollection().find(filter).sort({ createdAt: -1 }).toArray(),
    bookingsCollection().countDocuments({
      technicianEmail,
      status: "requested",
    }),
  ]);

  return { bookings, pendingRequests };
}

export async function updateTechnicianBookingStatus(
  bookingId: string,
  technicianEmail: string,
  nextStatus: BookingStatus,
  finalAmount?: number
) {
  if (!ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID.", 400);
  }

  const col = bookingsCollection();
  const booking = await col.findOne({ _id: new ObjectId(bookingId) });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }
  if (booking.technicianEmail !== technicianEmail) {
    throw new AppError(
      "Forbidden: You can only update bookings assigned to you.",
      403
    );
  }

  const allowedNext = ALLOWED_TECHNICIAN_TRANSITIONS[booking.status] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new AppError(
      `Invalid status transition from '${booking.status}' to '${nextStatus}'.`,
      400
    );
  }

  const now = new Date();
  const setFields: Record<string, unknown> = {
    status: nextStatus,
    updatedAt: now,
  };

  if (nextStatus === "completed") {
    if (typeof finalAmount !== "number" || finalAmount <= 0) {
      throw new AppError(
        "Final repair amount must be greater than zero.",
        400
      );
    }
    setFields.finalAmount = Number(finalAmount.toFixed(2));
  }

  await col.updateOne(
    { _id: booking._id },
    {
      $set: setFields,
      $push: { statusHistory: { status: nextStatus, changedAt: now } },
    }
  );

  return col.findOne({ _id: booking._id });
}

export async function addCustomerBookingReview(
  bookingId: string,
  customerEmail: string,
  rating: number,
  comment: string
) {
  if (!ObjectId.isValid(bookingId)) {
    throw new AppError("Invalid booking ID.", 400);
  }

  const col = bookingsCollection();
  const booking = await col.findOne({ _id: new ObjectId(bookingId) });

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }
  if (booking.customerEmail !== customerEmail) {
    throw new AppError("Forbidden: You can only review your own bookings.", 403);
  }
  if (booking.status !== "completed" || booking.paymentStatus !== "paid") {
    throw new AppError(
      "Reviews are only allowed for completed and paid bookings.",
      400
    );
  }
  if (booking.review) {
    throw new AppError("You have already reviewed this booking.", 409);
  }

  const now = new Date();
  const review = { rating, comment, createdAt: now };

  await col.updateOne(
    { _id: booking._id },
    { $set: { review, updatedAt: now } }
  );

  // Recalculate service average rating from paid reviews
  const reviewedBookings = await col
    .find({ serviceId: booking.serviceId, review: { $ne: null } })
    .toArray();

  if (ObjectId.isValid(booking.serviceId) && reviewedBookings.length > 0) {
    const sum = reviewedBookings.reduce(
      (acc, b) => acc + (b.review?.rating || 0),
      0
    );
    const avg = Number((sum / reviewedBookings.length).toFixed(2));
    await servicesCollection().updateOne(
      { _id: new ObjectId(booking.serviceId) },
      { $set: { ratingAverage: avg, reviewCount: reviewedBookings.length } }
    );
  }

  return col.findOne({ _id: booking._id });
}
