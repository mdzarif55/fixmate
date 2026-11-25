import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import type { Db, MongoClient } from "mongodb";
import { env } from "./env.js";

export function createAuth(db: Db, client?: MongoClient) {
  const trustedOrigins = Array.from(
    new Set(
      [env.CLIENT_URL, env.BETTER_AUTH_URL, "http://localhost:3000"].filter(
        Boolean
      )
    )
  );

  const socialProviders =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined;

  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins,
    database: mongodbAdapter(db, {
      client,
      transaction: false,
    }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders,
    user: {
      modelName: "users",
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "customer",
          input: true,
          returned: true,
        },
        phone: {
          type: "string",
          required: false,
          defaultValue: "",
          input: true,
          returned: true,
        },
        area: {
          type: "string",
          required: false,
          defaultValue: "",
          input: true,
          returned: true,
        },
        bio: {
          type: "string",
          required: false,
          defaultValue: "",
          input: true,
          returned: true,
        },
        plan: {
          type: "string",
          required: false,
          defaultValue: "free",
          input: false,
          returned: true,
        },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const requestedRole =
              typeof user.role === "string" ? user.role.trim() : "customer";
            if (requestedRole === "admin") {
              throw new APIError("FORBIDDEN", {
                message: "Admin registration is not allowed.",
              });
            }
            const safeRole =
              requestedRole === "technician" ? "technician" : "customer";

            return {
              data: {
                ...user,
                role: safeRole,
                phone: typeof user.phone === "string" ? user.phone : "",
                area: typeof user.area === "string" ? user.area : "",
                bio: typeof user.bio === "string" ? user.bio : "",
                plan: "free",
              },
            };
          },
        },
        update: {
          before: async (user) => {
            const data = { ...(user as Record<string, unknown>) };
            delete data.role;
            delete data.plan;
            return { data };
          },
        },
      },
    },
    plugins: [
      jwt({
        jwt: {
          expirationTime: "1h",
        },
      }),
    ],
  });
}

export type AuthInstance = ReturnType<typeof createAuth>;

let authInstance: AuthInstance | null = null;

export function initAuth(db: Db, client?: MongoClient): AuthInstance {
  authInstance = createAuth(db, client);
  return authInstance;
}

export function hasInitializedAuth(): boolean {
  return authInstance !== null;
}

export function getAuth(): AuthInstance {
  if (!authInstance) {
    throw new Error("Auth has not been initialized. Call initAuth() first.");
  }
  return authInstance;
}
