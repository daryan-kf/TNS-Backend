import {Request, Response} from "express";
import {
  successResponse,
  notFoundResponse,
  internalServerErrorResponse,
} from "@/src/utils/responses";
import {logger, logQuery} from "@/src/utils/logger";
import {createSafeQueryJob, fq, BQ} from "@/src/config/bigquery";
import {Team} from "@/types";

/**
 * Get all teams
 * GET /teams
 */
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    logger.info("Retrieving all teams", {ip: req.ip});

    const sql = `
      SELECT 
        team_id,
        name,
        organisation,
        created,
        modified
      FROM ${fq(BQ.sports.dataset!, "teams")}
      ORDER BY name ASC
    `;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql);
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    const teams: Team[] = rows.map((row: any) => ({
      team_id: row.team_id,
      name: row.name,
      organisation: row.organisation,
      created: row.created?.value || row.created,
      modified: row.modified?.value || row.modified,
    }));

    logger.info("Teams retrieved successfully", {
      count: teams.length,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      "Teams retrieved successfully",
      teams,
      teams.length
    );
  } catch (error: any) {
    logger.error("Failed to retrieve teams", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to retrieve teams");
  }
};

/**
 * Get team by ID
 * GET /teams/:teamId
 */
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const {teamId} = req.params;

    logger.info("Retrieving team by ID", {
      teamId,
      ip: req.ip,
    });

    const sql = `
      SELECT 
        team_id,
        name,
        organisation,
        created,
        modified
      FROM ${fq(BQ.sports.dataset!, "teams")}
      WHERE team_id = @teamId
      LIMIT 1
    `;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, {teamId});
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    if (rows.length === 0) {
      logger.warn("Team not found", {
        teamId,
        ip: req.ip,
      });

      return notFoundResponse(res, "Team");
    }

    const team: Team = {
      team_id: rows[0].team_id,
      name: rows[0].name,
      organisation: rows[0].organisation,
      created: rows[0].created?.value || rows[0].created,
      modified: rows[0].modified?.value || rows[0].modified,
    };

    logger.info("Team retrieved successfully", {
      teamId,
      teamName: team.name,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(res, "Team retrieved successfully", team);
  } catch (error: any) {
    logger.error("Failed to retrieve team by ID", {
      error: error.message,
      teamId: req.params.teamId,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to retrieve team");
  }
};
