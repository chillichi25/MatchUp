import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().trim().min(1, "Please enter a team name."),
  ageGroup: z.string().trim().min(1, "Please select an age group."),
  matchFormat: z.string().trim().min(1, "Please select a match format."),
  gender: z.string().trim().min(1, "Please select a team category."),
  level: z.string().trim().min(1, "Please select a team level."),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;

export const teamParamsSchema = z.object({
  clubName: z.string().trim().min(1),
  country: z.string().trim().min(1),
  county: z.string().trim(),
  city: z.string().trim().min(1),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  teamName: z.string().trim().min(1),
  ageGroup: z.string().trim().min(1),
  matchFormat: z.string().trim().min(1),
  gender: z.string().trim().min(1),
  level: z.string().trim().min(1),
});

export type TeamParams = z.infer<typeof teamParamsSchema>;
