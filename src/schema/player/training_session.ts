import {z} from "zod";

export const params = z.object({
  id: z.string().min(1, "player id required"),
});

export const query = z.object({
  start: z.string().datetime().optional(), // ISO 8601 (very light check)
  end: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  offset: z.coerce.number().int().min(0).default(0),
});

export type Params = z.infer<typeof params>;
export type Query = z.infer<typeof query>;
