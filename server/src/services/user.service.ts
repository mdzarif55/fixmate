import { servicesCollection, usersCollection } from "../database/mongo.js";
import type { AuthenticatedUser } from "../types/index.js";
import { AppError } from "../utils/responses.js";

export async function updateUserProfile(
  user: AuthenticatedUser,
  input: {
    name: string;
    phone?: string;
    area?: string;
    bio?: string;
    image?: string | null;
  }
) {
  const users = usersCollection();
  const now = new Date();

  const updateFields: Record<string, unknown> = {
    name: input.name,
    phone: input.phone ?? "",
    area: input.area ?? "",
    bio: input.bio ?? "",
    updatedAt: now,
  };

  if (input.image !== undefined) {
    updateFields.image = input.image;
  }

  const result = await users.findOneAndUpdate(
    { email: user.email },
    { $set: updateFields },
    { returnDocument: "after" }
  );

  if (!result) {
    throw new AppError("User account not found.", 404);
  }

  if (user.role === "technician" && input.name !== user.name) {
    await servicesCollection().updateMany(
      { technicianEmail: user.email },
      { $set: { technicianName: input.name, updatedAt: now } }
    );
  }

  return {
    _id: String(result._id),
    id: String(result._id),
    name: result.name,
    email: result.email,
    image: result.image ?? null,
    role: result.role,
    phone: result.phone ?? "",
    area: result.area ?? "",
    bio: result.bio ?? "",
    plan: result.plan === "pro" ? "pro" : "free",
    createdAt: result.createdAt,
  };
}

export async function upgradeTechnicianToPro(user: AuthenticatedUser) {
  const users = usersCollection();
  const now = new Date();

  const result = await users.findOneAndUpdate(
    { email: user.email },
    { $set: { plan: "pro", updatedAt: now } },
    { returnDocument: "after" }
  );

  if (!result) {
    throw new AppError("User account not found.", 404);
  }

  await servicesCollection().updateMany(
    { technicianEmail: user.email },
    { $set: { technicianIsPro: true, updatedAt: now } }
  );

  return {
    plan: "pro" as const,
  };
}
