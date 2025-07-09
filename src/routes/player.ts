import {Router} from "express";
import {addPlayerAssessment} from "@/src/controllers/player/assessment";
import {
  getAllPlayersPerformance,
  getPlayerPerformanceById,
} from "@/src/controllers/player/performance";

import {searchPlayers} from "@/src/controllers/player/search";

const router = Router();

// Assessment routes
router.post("/assessment", addPlayerAssessment);

// Performance routes
router.get("/performance", getAllPlayersPerformance);
router.get("/performance/:playerId", getPlayerPerformanceById);

// Search routes
router.get("/search", searchPlayers);

export default router;
