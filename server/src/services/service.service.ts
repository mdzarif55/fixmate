import { ObjectId, type Filter } from "mongodb";
import {
  bookingsCollection,
  servicesCollection,
  usersCollection,
} from "../database/mongo.js";
import type { AuthenticatedUser, ServiceDoc } from "../types/index.js";
import {
  FREE_TECHNICIAN_SERVICE_LIMIT,
  SERVICE_CATEGORIES,
  SERVICE_MODES,
  type ServiceCategory,
  type ServiceMode,
} from "../utils/constants.js";
import { AppError } from "../utils/responses.js";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface ListPublicServicesParams {
  search?: string;
  category?: string;
  serviceMode?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function listPublicServices(params: ListPublicServicesParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(24, Math.max(1, Number(params.limit) || 9));
  const skip = (page - 1) * limit;

  const filter: Filter<ServiceDoc> = {
    approvalStatus: "approved",
    isAvailable: true,
  };

  if (params.search && params.search.trim()) {
    const regex = new RegExp(escapeRegex(params.search.trim()), "i");
    filter.$or = [{ title: regex }, { category: regex }];
  }

  if (
    params.category &&
    (SERVICE_CATEGORIES as readonly string[]).includes(params.category)
  ) {
    filter.category = params.category as ServiceCategory;
  }

  if (
    params.serviceMode &&
    (SERVICE_MODES as readonly string[]).includes(params.serviceMode)
  ) {
    filter.serviceMode = params.serviceMode as ServiceMode;
  }

  let sortStage: Record<string, 1 | -1> = { createdAt: -1 };
  if (params.sort === "price-low") {
    sortStage = { basePrice: 1, createdAt: -1 };
  } else if (params.sort === "price-high") {
    sortStage = { basePrice: -1, createdAt: -1 };
  }

  const col = servicesCollection();
  const [services, total] = await Promise.all([
    col.find(filter).sort(sortStage).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ]);

  return {
    services,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getPublicServiceById(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Service not found.", 404);
  }

  const service = await servicesCollection().findOne({
    _id: new ObjectId(id),
    approvalStatus: "approved",
    isAvailable: true,
  });

  if (!service) {
    throw new AppError("Service not found or unavailable.", 404);
  }

  const [technicianDoc, reviewDocs] = await Promise.all([
    usersCollection().findOne(
      { email: service.technicianEmail.toLowerCase() },
      {
        projection: {
          name: 1,
          email: 1,
          image: 1,
          area: 1,
          bio: 1,
          plan: 1,
        },
      }
    ),
    bookingsCollection()
      .find({
        serviceId: id,
        paymentStatus: "paid",
        review: { $ne: null },
      })
      .sort({ "review.createdAt": -1 })
      .limit(20)
      .toArray(),
  ]);

  const reviews = reviewDocs
    .filter((b) => b.review)
    .map((b) => ({
      _id: String(b._id),
      customerName: b.customerName,
      rating: b.review!.rating,
      comment: b.review!.comment,
      createdAt: b.review!.createdAt,
    }));

  return {
    service,
    technician: technicianDoc
      ? {
          name: technicianDoc.name,
          email: technicianDoc.email,
          image: technicianDoc.image ?? null,
          area: technicianDoc.area ?? "",
          bio: technicianDoc.bio ?? "",
          plan: technicianDoc.plan === "pro" ? "pro" : "free",
        }
      : null,
    reviews,
  };
}

export async function createTechnicianService(
  technician: AuthenticatedUser,
  input: {
    title: string;
    category: ServiceCategory;
    description: string;
    image: string;
    basePrice: number;
    estimatedDuration: string;
    serviceMode: ServiceMode;
    serviceArea: string;
  }
) {
  const col = servicesCollection();
  const isPro = technician.plan === "pro";

  if (!isPro) {
    const existingCount = await col.countDocuments({
      technicianEmail: technician.email,
    });
    if (existingCount >= FREE_TECHNICIAN_SERVICE_LIMIT) {
      throw new AppError(
        `Free plan supports up to ${FREE_TECHNICIAN_SERVICE_LIMIT} services. Upgrade to FixMate Pro for unlimited service listings.`,
        403
      );
    }
  }

  const now = new Date();
  const doc: Omit<ServiceDoc, "_id"> = {
    title: input.title,
    category: input.category,
    description: input.description,
    image: input.image,
    basePrice: input.basePrice,
    estimatedDuration: input.estimatedDuration,
    serviceMode: input.serviceMode,
    serviceArea: input.serviceArea,
    technicianName: technician.name,
    technicianEmail: technician.email,
    technicianIsPro: isPro,
    approvalStatus: "pending",
    isAvailable: true,
    ratingAverage: 0,
    reviewCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const result = await col.insertOne(doc as ServiceDoc);
  return { _id: result.insertedId, ...doc };
}

export async function listTechnicianServices(technicianEmail: string) {
  const services = await servicesCollection()
    .find({ technicianEmail })
    .sort({ createdAt: -1 })
    .toArray();

  const totalServices = services.length;
  const approvedServices = services.filter(
    (s) => s.approvalStatus === "approved"
  ).length;
  const pendingServices = services.filter(
    (s) => s.approvalStatus === "pending"
  ).length;

  return {
    services,
    stats: {
      totalServices,
      approvedServices,
      pendingServices,
    },
  };
}

export async function updateTechnicianService(
  id: string,
  technicianEmail: string,
  updates: Partial<{
    title: string;
    category: ServiceCategory;
    description: string;
    image: string;
    basePrice: number;
    estimatedDuration: string;
    serviceMode: ServiceMode;
    serviceArea: string;
    isAvailable: boolean;
  }>
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid service ID.", 400);
  }

  const col = servicesCollection();
  const existing = await col.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    throw new AppError("Service not found.", 404);
  }
  if (existing.technicianEmail !== technicianEmail) {
    throw new AppError("Forbidden: You can only edit your own services.", 403);
  }

  const contentFieldsChanged =
    updates.title !== undefined ||
    updates.category !== undefined ||
    updates.description !== undefined ||
    updates.image !== undefined ||
    updates.basePrice !== undefined ||
    updates.estimatedDuration !== undefined ||
    updates.serviceMode !== undefined ||
    updates.serviceArea !== undefined;

  const setPayload: Record<string, unknown> = {
    ...updates,
    updatedAt: new Date(),
  };

  if (contentFieldsChanged) {
    setPayload.approvalStatus = "pending";
  }

  await col.updateOne({ _id: existing._id }, { $set: setPayload });
  const updated = await col.findOne({ _id: existing._id });
  return updated;
}

export async function deleteTechnicianService(
  id: string,
  technicianEmail: string
) {
  if (!ObjectId.isValid(id)) {
    throw new AppError("Invalid service ID.", 400);
  }

  const col = servicesCollection();
  const existing = await col.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    throw new AppError("Service not found.", 404);
  }
  if (existing.technicianEmail !== technicianEmail) {
    throw new AppError(
      "Forbidden: You can only delete your own services.",
      403
    );
  }

  await col.deleteOne({ _id: existing._id });
  return { deletedId: id };
}
