import {Router} from "express";
import {
  getAllPlayersPerformance,
  getPlayerPerformanceById,
} from "../../controllers/player/performance";

const router = Router();

router.get("/performance", getAllPlayersPerformance);
router.get("/performance/:playerId", getPlayerPerformanceById);

export default router;
