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
    const {limit, offset, start, end}: SessionQuery = req.query as any;

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

/**
 * Get player session statistics
 * GET /players/:id/sessions/stats
 */
export const getPlayerSessionStats = async (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    logger.info("Retrieving player session statistics", {
      playerId: id,
      ip: req.ip,
    });

    const sql = `
      SELECT
        COUNT(*) as total_sessions,
        AVG(duration_ms) as avg_duration_ms,
        AVG(heart_rate_avg) as avg_heart_rate,
        MAX(heart_rate_max) as max_heart_rate_recorded,
        AVG(training_load) as avg_training_load,
        SUM(distance_meters) as total_distance_meters,
        SUM(calories) as total_calories,
        MIN(start_time) as first_session_date,
        MAX(start_time) as last_session_date
      FROM ${fq(BQ.sports.dataset!, BQ.sports.playerTraining!)}
      WHERE player_id = @playerId
    `;

    const startTime = Date.now();
    const rows = await createSafeQueryJob(sql, {playerId: id});
    const queryDuration = Date.now() - startTime;

    logQuery(sql, queryDuration);

    if (rows.length === 0 || rows[0].total_sessions === 0) {
      return successResponse(res, "No session statistics found for player", {
        playerId: id,
        stats: null,
      });
    }

    const stats = {
      playerId: id,
      sessionStats: {
        totalSessions: parseInt(rows[0].total_sessions) || 0,
        avgDurationMinutes: Math.round((rows[0].avg_duration_ms || 0) / 60000),
        avgHeartRate: Math.round(rows[0].avg_heart_rate || 0),
        maxHeartRateRecorded: rows[0].max_heart_rate_recorded || 0,
        avgTrainingLoad: Math.round(rows[0].avg_training_load || 0),
        totalDistanceKm:
          Math.round(((rows[0].total_distance_meters || 0) / 1000) * 10) / 10,
        totalCalories: rows[0].total_calories || 0,
        firstSessionDate: rows[0].first_session_date,
        lastSessionDate: rows[0].last_session_date,
      },
    };

    logger.info("Player session statistics retrieved", {
      playerId: id,
      totalSessions: stats.sessionStats.totalSessions,
      queryDuration: `${queryDuration}ms`,
      ip: req.ip,
    });

    return successResponse(
      res,
      "Player session statistics retrieved successfully",
      stats
    );
  } catch (error: any) {
    logger.error("Failed to retrieve player session statistics", {
      error: error.message,
      playerId: req.params.id,
      ip: req.ip,
    });

    return internalServerErrorResponse(
      res,
      "Failed to retrieve session statistics"
    );
  }
};
