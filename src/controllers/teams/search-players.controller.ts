import {Request, Response} from "express";
import {
  successResponse,
  internalServerErrorResponse,
} from "@/src/utils/responses";
import {logger, logQuery} from "@/src/utils/logger";
import {createSafeQueryJob, fq, BQ} from "@/src/config/bigquery";
import {TeamPlayer} from "@/types";

/**
 * Search players within a team
 * GET /teams/:teamId/players/search
 */
export const searchTeamPlayers = async (req: Request, res: Response) => {
  try {
    const {teamId} = req.params;
    const {
      query = "",
      role = "",
      status = "",
      limit = 50,
      offset = 0,
    } = req.query;

    logger.info("Searching team players", {
      teamId,
      query,
      role,
      status,
      limit,
      offset,
      ip: req.ip,
    });

    // Build dynamic WHERE conditions
    const conditions = [`team_id = @teamId`];
    const params: any = {teamId};

    // Add search query condition (searches in first_name, last_name, and player_number)
    if (query && typeof query === "string" && query.trim()) {
      conditions.push(
        `(LOWER(first_name) LIKE LOWER(@searchQuery) OR 
         LOWER(last_name) LIKE LOWER(@searchQuery) OR 
         CAST(player_number AS STRING) LIKE @searchQuery)`
      );
      params.searchQuery = `%${query.trim()}%`;
    }

    // Add role filter
    if (role && typeof role === "string" && role.trim()) {
      conditions.push(`LOWER(role) = LOWER(@role)`);
      params.role = role.trim();
    }

    // Add status filter
    if (status && typeof status === "string" && status.trim()) {
      conditions.push(`LOWER(status) = LOWER(@status)`);
      params.status = status.trim();
    }

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
      WHERE ${conditions.join(" AND ")}
      ORDER BY player_number ASC, last_name ASC
      LIMIT @limit OFFSET @offset
    `;

    // Add pagination parameters
    params.limit = Math.min(parseInt(limit as string) || 50, 100); // Max 100 results
    params.offset = Math.max(parseInt(offset as string) || 0, 0);

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, params);
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

    // Get total count for pagination info
    const countSql = `
      SELECT COUNT(*) as total
      FROM ${fq(BQ.sports.dataset!, "players")}
      WHERE ${conditions.join(" AND ")}
    `;

    const countParams = {...params};
    delete countParams.limit;
    delete countParams.offset;

    const countRows = await createSafeQueryJob(countSql, countParams);
    const totalCount = countRows[0]?.total || 0;

    logger.info("Team players search completed", {
      teamId,
      query,
      role,
      status,
      resultsCount: players.length,
      totalCount,
      limit: params.limit,
      offset: params.offset,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      `Team players search completed successfully`,
      {
        teamId,
        players,
        pagination: {
          total: totalCount,
          limit: params.limit,
          offset: params.offset,
          hasMore: params.offset + players.length < totalCount,
        },
        filters: {
          query: query || null,
          role: role || null,
          status: status || null,
        },
        summary: {
          totalResults: players.length,
          totalAvailable: totalCount,
          roles: [...new Set(players.map(p => p.role))],
          statuses: [...new Set(players.map(p => p.status))],
        },
      },
      players.length
    );
  } catch (error: any) {
    logger.error("Failed to search team players", {
      error: error.message,
      teamId: req.params.teamId,
      query: req.query.query,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to search team players");
  }
};
