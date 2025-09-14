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
 * Get team member statistics
 * GET /teams/:teamId/players/stats
 */
export const getTeamMemberStats = async (req: Request, res: Response) => {
  try {
    const {teamId} = req.params;

    logger.info("Retrieving team member statistics", {
      teamId,
      ip: req.ip,
    });

    const sql = `
      SELECT 
        COUNT(*) as total_players,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_players,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_players,
        COUNT(DISTINCT role) as unique_roles,
        STRING_AGG(DISTINCT role, ', ') as all_roles
      FROM ${fq(BQ.sports.dataset!, "players")}
      WHERE team_id = @teamId
    `;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, {teamId});
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    if (rows.length === 0) {
      return successResponse(res, "No players found for team", {
        teamId,
        stats: null,
      });
    }

    const stats = {
      teamId,
      playerStats: {
        total: parseInt(rows[0].total_players) || 0,
        active: parseInt(rows[0].active_players) || 0,
        inactive: parseInt(rows[0].inactive_players) || 0,
        uniqueRoles: parseInt(rows[0].unique_roles) || 0,
        roles: rows[0].all_roles ? rows[0].all_roles.split(", ") : [],
      },
    };

    logger.info("Team member statistics retrieved successfully", {
      teamId,
      totalPlayers: stats.playerStats.total,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      "Team member statistics retrieved successfully",
      stats
    );
  } catch (error: any) {
    logger.error("Failed to retrieve team member statistics", {
      error: error.message,
      teamId: req.params.teamId,
      ip: req.ip,
    });

    return internalServerErrorResponse(
      res,
      "Failed to retrieve team member statistics"
    );
  }
};
