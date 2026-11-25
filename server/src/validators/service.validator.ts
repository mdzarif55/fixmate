import { z } from "zod";
import { SERVICE_CATEGORIES, SERVICE_MODES } from "../utils/constants.js";

export const createServiceSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  category: z.enum(SERVICE_CATEGORIES, {
    message: "Please select a valid repair category.",
  }),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters."),
  image: z.string().trim().url("Please upload a valid service image."),
  basePrice: z.coerce
    .number()
    .positive("Base price must be greater than zero."),
  estimatedDuration: z
    .string()
    .trim()
    .min(2, "Estimated duration is required."),
  serviceMode: z.enum(SERVICE_MODES, {
    message: "Please select a valid service mode.",
  }),
  serviceArea: z.string().trim().min(2, "Service area is required."),
});

export const updateServiceSchema = z
  .object({
    title: z.string().trim().min(3).optional(),
    category: z.enum(SERVICE_CATEGORIES).optional(),
    description: z.string().trim().min(20).optional(),
    image: z.string().trim().url().optional(),
    basePrice: z.coerce.number().positive().optional(),
    estimatedDuration: z.string().trim().min(2).optional(),
    serviceMode: z.enum(SERVICE_MODES).optional(),
    serviceArea: z.string().trim().min(2).optional(),
    isAvailable: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update.",
  });
