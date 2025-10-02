import { Router } from 'express';
import { validate } from '@/src/middleware/validation';
import {
  teamIdSchema,
  teamPlayerSearchSchema,
  teamPlayerParamsSchema,
} from '@/src/schemas/teams';

import {
  getAllTeams,
  getTeamById,
  getTeamMembers,
  getTeamPlayerById,
} from '@/src/controllers/teams';
import { searchTeamPlayers } from '@/src/controllers/teams/search-players.controller';

const router = Router();

// Core team routes
router.get('/', getAllTeams);
router.get('/:teamId', validate({ params: teamIdSchema }), getTeamById);

// Team member routes
router.get(
  '/:teamId/players',
  validate({ params: teamIdSchema }),
  getTeamMembers
);

// Team player search route (must come before player-by-ID route)
router.get(
  '/:teamId/players/search',
  validate({ params: teamIdSchema, query: teamPlayerSearchSchema }),
  searchTeamPlayers
);

// Team player by ID route
router.get(
  '/:teamId/players/:playerId',
  validate({ params: teamPlayerParamsSchema }),
  getTeamPlayerById
);

export default router;
