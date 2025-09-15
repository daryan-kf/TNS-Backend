import {Request, Response} from "express";
import {
  successResponse,
  internalServerErrorResponse,
} from "@/src/utils/responses";
import {logger, logQuery} from "@/src/utils/logger";
import {createSafeQueryJob, fq, BQ} from "@/src/config/bigquery";
import {SessionQuery, PlayerIdParams} from "@/src/schemas/players";

/**
 * Get player training sessions
 * GET /players/:id/sessions
 */
export const getPlayerSessions = async (req: Request, res: Response) => {
  try {
    const {id}: PlayerIdParams = req.params as any;
    // Use validated query if available, otherwise fall back to req.query
    const query = (req as any).validatedQuery || req.query;
    const {limit, offset, start, end}: SessionQuery = query as any;

    logger.info("Retrieving player training sessions", {
      playerId: id,
      limit,
      offset,
      start,
      end,
      ip: req.ip,
    });

    // Build SQL query with optional date filtering
    let sql = `
      SELECT
        team_id,
        training_id,
        player_id,
        player_session_id,
        start_time,
        stop_time,
        duration_ms,
        distance_meters,
        calories,
        training_load,
        cardio_load,
        muscle_load,
        heart_rate_avg,
        heart_rate_max,
        sprints,
        run_distance_m,
        walk_distance_m,
        rmssd_ms,
        sdnn_ms,
        pnn50,
        created_at
      FROM ${fq(BQ.sports.dataset!, BQ.sports.playerTraining!)}
      WHERE player_id = @playerId
    `;

    const queryParams: any = {
      playerId: id,
      limit,
      offset,
    };

    // Add date filtering if provided
    if (start) {
      sql += ` AND start_time >= @startTime`;
      queryParams.startTime = start;
    }

    if (end) {
      sql += ` AND start_time <= @endTime`;
      queryParams.endTime = end;
    }

    sql += ` ORDER BY start_time DESC LIMIT @limit OFFSET @offset`;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, queryParams);
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    logger.info("Player training sessions retrieved", {
      playerId: id,
      sessionCount: rows.length,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      `Training sessions retrieved for player ${id}`,
      {
        playerId: id,
        sessions: rows,
        pagination: {
          limit,
          offset,
          count: rows.length,
          hasMore: rows.length === limit,
        },
        filters: {
          ...(start && {startDate: start}),
          ...(end && {endDate: end}),
        },
      },
      rows.length
    );
  } catch (error: any) {
    logger.error("Failed to retrieve player training sessions", {
      error: error.message,
      playerId: req.params.id,
      ip: req.ip,
    });

    return internalServerErrorResponse(
      res,
      "Failed to retrieve training sessions"
    );
  }
};
