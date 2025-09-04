import {Router} from "express";
import {
  addPlayerAssessment,
  getPlayerAssessment,
  updatePlayerAssessment,
} from "@/src/controllers/player/assessment";
import {getAllPlayers, getPlayerById} from "@/src/controllers/player";

import {searchPlayers} from "@/src/controllers/player/search";
import {getPlayerSessions} from "@/src/controllers/player/training_session";

const router = Router();

// Player routes
router.get("/", getAllPlayers);

// Search routes (must come before /:id)
router.get("/search", searchPlayers);

// Specific player by ID (must come after /search)
router.get("/:id", getPlayerById);

// Assessment routes
router.post("/:id/assessment", addPlayerAssessment);
router.get("/:id/assessment/:assessmentId", getPlayerAssessment);
router.put("/:id/assessment/:assessmentId", updatePlayerAssessment);
router.get("/:id/sessions", getPlayerSessions);

export default router;
