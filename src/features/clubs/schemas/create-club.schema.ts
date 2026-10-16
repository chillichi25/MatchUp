import { z } from "zod";

import type { LocationValue } from "../types";

export const clubLocationSchema = z.object({
  city: z.string().trim().min(1, "Please select your club's location."),
  county: z.string().trim(),
  country: z.string().trim().min(1, "Please select your club's location."),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  formatted: z.string(),
}) satisfies z.ZodType<LocationValue>;

export const createClubSchema = z.object({
  name: z.string().trim().min(1, "Please enter your club name."),
  location: clubLocationSchema,
});

export type CreateClubSchema = z.infer<typeof createClubSchema>;
