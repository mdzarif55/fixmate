import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.string().trim().max(30).optional().default(""),
  area: z.string().trim().max(120).optional().default(""),
  bio: z.string().trim().max(500).optional().default(""),
  image: z.string().trim().url().nullable().optional(),
});
