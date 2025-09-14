import {Router} from "express";
import {validate} from "@/src/middleware/validation";
import {teamIdSchema} from "@/src/schemas/teams";

import {
  getAllTeams,
  getTeamById,
  getTeamMembers,
  getTeamMemberStats,
} from "@/src/controllers/teams";

const router = Router();

// Core team routes
router.get("/", getAllTeams);
router.get("/:teamId", validate({params: teamIdSchema}), getTeamById);

// Team member routes
router.get(
  "/:teamId/players",
  validate({params: teamIdSchema}),
  getTeamMembers
);
router.get(
  "/:teamId/players/stats",
  validate({params: teamIdSchema}),
  getTeamMemberStats
);

export default router;
