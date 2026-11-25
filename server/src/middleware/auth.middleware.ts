import type { NextFunction, Request, Response } from "express";
import { createLocalJWKSet, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
import { getAuth } from "../config/auth.js";
import { env } from "../config/env.js";
import { usersCollection } from "../database/mongo.js";
import type { AuthenticatedUser } from "../types/index.js";
import type { UserRole } from "../utils/constants.js";
import { AppError } from "../utils/responses.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function verifyToken(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Unauthorized: Missing bearer token.", 401);
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new AppError("Unauthorized: Empty bearer token.", 401);
    }

    const auth = getAuth();
    const jwks = await auth.api.getJwks();
    if (!jwks?.keys?.length) {
      throw new AppError("Unauthorized: Invalid token.", 401);
    }

    const jwkSet = createLocalJWKSet(jwks);
    const { payload } = await jwtVerify(token, jwkSet, {
      issuer: env.BETTER_AUTH_URL,
      audience: env.BETTER_AUTH_URL,
    });

    const email =
      typeof payload.email === "string" ? payload.email.toLowerCase() : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;

    if (!email && !sub) {
      throw new AppError("Unauthorized: Invalid token claims.", 401);
    }

    const users = usersCollection();
    let userDoc = email ? await users.findOne({ email }) : null;

    if (!userDoc && sub) {
      if (ObjectId.isValid(sub)) {
        userDoc = await users.findOne({ _id: new ObjectId(sub) });
      }
      if (!userDoc) {
        userDoc = await users.findOne({ _id: sub as unknown as ObjectId });
      }
    }

    if (!userDoc) {
      throw new AppError("Unauthorized: User account not found.", 401);
    }

    req.user = {
      id: String(userDoc._id),
      name: userDoc.name,
      email: userDoc.email,
      role: (userDoc.role || "customer") as UserRole,
      image: userDoc.image ?? null,
      phone: userDoc.phone ?? "",
      area: userDoc.area ?? "",
      bio: userDoc.bio ?? "",
      plan: userDoc.plan === "pro" ? "pro" : "free",
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError("Unauthorized: Invalid or expired token.", 401));
  }
}

function requireRole(role: UserRole, message: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Unauthorized: Authentication required.", 401));
    }
    if (req.user.role !== role) {
      return next(new AppError(message, 403));
    }
    next();
  };
}

export const verifyCustomer = requireRole(
  "customer",
  "Forbidden: Customer access required."
);

export const verifyTechnician = requireRole(
  "technician",
  "Forbidden: Technician access required."
);

export const verifyAdmin = requireRole(
  "admin",
  "Forbidden: Admin access required."
);
