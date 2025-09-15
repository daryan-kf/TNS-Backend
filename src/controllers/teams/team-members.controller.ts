import {Request, Response} from "express";
import {
  successResponse,
  internalServerErrorResponse,
} from "@/src/utils/responses";
import {logger, logQuery} from "@/src/utils/logger";
import {createSafeQueryJob, fq, BQ} from "@/src/config/bigquery";
import {TeamPlayer} from "@/types";

/**
 * Get all players within a team
 * GET /teams/:teamId/players
 */
export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const {teamId} = req.params;

    logger.info("Retrieving team members", {
      teamId,
      ip: req.ip,
    });

    const sql = `
      SELECT 
        team_id,
        player_id,
        player_number,
        first_name,
        last_name,
        role,
        status,
        created,
        modified
      FROM ${fq(BQ.sports.dataset!, "players")}
      WHERE team_id = @teamId
      ORDER BY player_number ASC, last_name ASC
    `;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, {teamId});
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    const players: TeamPlayer[] = rows.map((row: any) => ({
      team_id: row.team_id,
      player_id: row.player_id,
      player_number: row.player_number,
      first_name: row.first_name,
      last_name: row.last_name,
      role: row.role,
      status: row.status,
      created: row.created?.value || row.created,
      modified: row.modified?.value || row.modified,
    }));

    logger.info("Team members retrieved successfully", {
      teamId,
      memberCount: players.length,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      `Team members retrieved successfully`,
      {
        teamId,
        members: players,
        summary: {
          totalMembers: players.length,
          activeMembers: players.filter(p => p.status === "active").length,
          roles: [...new Set(players.map(p => p.role))],
        },
      },
      players.length
    );
  } catch (error: any) {
    logger.error("Failed to retrieve team members", {
      error: error.message,
      teamId: req.params.teamId,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to retrieve team members");
  }
};

/**
 * Get a specific player by ID within a team
 * GET /teams/:teamId/players/:playerId
 */
export const getTeamPlayerById = async (req: Request, res: Response) => {
  try {
    const {teamId, playerId} = req.params;

    logger.info("Retrieving team player by ID", {
      teamId,
      playerId,
      ip: req.ip,
    });

    const sql = `
      SELECT 
        team_id,
        player_id,
        player_number,
        first_name,
        last_name,
        role,
        status,
        created,
        modified
      FROM ${fq(BQ.sports.dataset!, "players")}
      WHERE team_id = @teamId AND player_id = @playerId
    `;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, {teamId, playerId});
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    if (rows.length === 0) {
      logger.warn("Team player not found", {
        teamId,
        playerId,
        ip: req.ip,
      });

      return res.status(404).json({
        success: false,
        message: "Player not found in this team",
        data: null,
      });
    }

    const player: TeamPlayer = {
      team_id: rows[0].team_id,
      player_id: rows[0].player_id,
      player_number: rows[0].player_number,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      role: rows[0].role,
      status: rows[0].status,
      created: rows[0].created?.value || rows[0].created,
      modified: rows[0].modified?.value || rows[0].modified,
    };

    logger.info("Team player retrieved successfully", {
      teamId,
      playerId,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      `Team player retrieved successfully`,
      {
        teamId,
        player: player,
      },
      1
    );
  } catch (error: any) {
    logger.error("Failed to retrieve team player", {
      error: error.message,
      teamId: req.params.teamId,
      playerId: req.params.playerId,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to retrieve team player");
  }
};
