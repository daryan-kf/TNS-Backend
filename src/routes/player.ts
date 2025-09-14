import {Router} from "express";
import {validate} from "@/src/middleware/validation";
import {
  playerIdSchema,
  searchQuerySchema,
  sessionQuerySchema,
} from "@/src/schemas/players";

// Import from new controller structure
import {
  getAllPlayers,
  getPlayerById,
  searchPlayers,
  getPlayerSummary,
} from "@/src/controllers/players/players.controller";

import {
  getPlayerSessions,
  getPlayerSessionStats,
} from "@/src/controllers/players/player-sessions.controller";

const router = Router();

// Core player routes
router.get("/", getAllPlayers);

// Search routes (must come before /:id to avoid conflicts)
router.get("/search", validate({query: searchQuerySchema}), searchPlayers);

// Specific player by ID (must come after /search)
router.get("/:id", validate({params: playerIdSchema}), getPlayerById);

router.get(
  "/:id/summary",
  validate({params: playerIdSchema}),
  getPlayerSummary
);

// Training session routes
router.get(
  "/:id/sessions",
  validate({
    params: playerIdSchema,
    query: sessionQuerySchema,
  }),
  getPlayerSessions
);

router.get(
  "/:id/sessions/stats",
  validate({params: playerIdSchema}),
  getPlayerSessionStats
);

export default router;
