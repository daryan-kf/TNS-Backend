import {Router} from "express";
import {addPlayerAssessment} from "../controllers/player/assessment";
import {
  getAllPlayersPerformance,
  getPlayerPerformanceById,
} from "../controllers/player/performance";

const router = Router();

// Assessment routes
router.post("/assessment", addPlayerAssessment);

// Performance routes
router.get("/performance", getAllPlayersPerformance);
router.get("/performance/:playerId", getPlayerPerformanceById);

export default router;
