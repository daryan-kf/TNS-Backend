import { z } from 'zod';

// Player ID parameter schema
export const playerIdSchema = z.object({
  id: z
    .string()
    .min(1, 'Player ID is required')
    .max(50, 'Player ID too long')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Player ID contains invalid characters'),
});

// Search query schema
export const searchQuerySchema = z.object({
  query: z
    .string()
    .max(100, 'Search query too long')
    .optional()
    .transform(val => val?.trim() || ''),
});

// Training session query schema
export const sessionQuerySchema = z.object({
  start: z.string().datetime('Invalid start date format').optional(),
  end: z.string().datetime('Invalid end date format').optional(),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(1000, 'Limit cannot exceed 1000')
    .default(100),
  offset: z.coerce
    .number()
    .int('Offset must be an integer')
    .min(0, 'Offset cannot be negative')
    .default(0),
});

export type PlayerIdParams = z.infer<typeof playerIdSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type SessionQuery = z.infer<typeof sessionQuerySchema>;
