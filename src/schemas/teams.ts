import { z } from 'zod';

// Team ID parameter schema
export const teamIdSchema = z.object({
  teamId: z
    .string()
    .min(1, 'Team ID is required')
    .max(50, 'Team ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Team ID contains invalid characters'),
});

// Team player parameters schema (teamId + playerId)
export const teamPlayerParamsSchema = z.object({
  teamId: z
    .string()
    .min(1, 'Team ID is required')
    .max(50, 'Team ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Team ID contains invalid characters'),
  playerId: z
    .string()
    .min(1, 'Player ID is required')
    .max(50, 'Player ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Player ID contains invalid characters'),
});

// Team creation schema (if you add team creation later)
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name too long')
    .trim(),
  organisation: z
    .string()
    .min(1, 'Organisation is required')
    .max(100, 'Organisation name too long')
    .trim(),
});

// Team update schema
export const updateTeamSchema = createTeamSchema.partial();

// Team player search query schema
export const teamPlayerSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  role: z
    .string()
    .max(50, 'Role too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  status: z
    .string()
    .max(50, 'Status too long')
    .optional()
    .transform(val => val?.trim() || undefined),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(50),
  offset: z.coerce
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0),
});

export type TeamIdParams = z.infer<typeof teamIdSchema>;
export type TeamPlayerParams = z.infer<typeof teamPlayerParamsSchema>;
export type CreateTeamData = z.infer<typeof createTeamSchema>;
export type UpdateTeamData = z.infer<typeof updateTeamSchema>;
export type TeamPlayerSearchQuery = z.infer<typeof teamPlayerSearchSchema>;
