import {z} from "zod";

// Team ID parameter schema
export const teamIdSchema = z.object({
  teamId: z
    .string()
    .min(1, "Team ID is required")
    .max(50, "Team ID too long")
    .regex(/^[a-zA-Z0-9\-_]+$/, "Team ID contains invalid characters"),
});

// Team creation schema (if you add team creation later)
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Team name is required")
    .max(100, "Team name too long")
    .trim(),
  organisation: z
    .string()
    .min(1, "Organisation is required")
    .max(100, "Organisation name too long")
    .trim(),
});

// Team update schema
export const updateTeamSchema = createTeamSchema.partial();

export type TeamIdParams = z.infer<typeof teamIdSchema>;
export type CreateTeamData = z.infer<typeof createTeamSchema>;
export type UpdateTeamData = z.infer<typeof updateTeamSchema>;
