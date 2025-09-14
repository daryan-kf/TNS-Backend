import {Router} from "express";
import {
  getAllTeams,
  getTeam,
  getAllPlayersWithinTeam,
} from "@/src/controllers/team";

const router = Router();

// Team routes
router.get("/", getAllTeams);
router.get("/:teamId", getTeam);
router.get("/:teamId/players", getAllPlayersWithinTeam);

export default router;
