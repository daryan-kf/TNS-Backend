import {RequestHandler} from "express";
import {z} from "zod";
import {params, query} from "@/src/schema/player/training_session";
import {bq, BQ, fq} from "@/src/config/bigquery";

export const getPlayerSessions: RequestHandler = async (req, res, next) => {
  try {
    const {id} = params.parse(req.params);
    const {limit, offset} = query.parse(req.query);

    const sql = `
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
      FROM ${fq(BQ.sports.dataset, BQ.sports.playerTraining)}
      WHERE player_id = @playerId
      ORDER BY start_time DESC
      LIMIT @limit
      OFFSET @offset
    `;

    const [job] = await bq.createQueryJob({
      query: sql,
      params: {
        playerId: id,
        limit,
        offset,
      },
      location: BQ.location,
      useLegacySql: false,
      maximumBytesBilled: "5368709120", // 5 GiB in bytes as string
    });

    const [rows] = await job.getQueryResults();
    res.json({data: rows, limit, offset});
  } catch (err) {
    // If validation failed, return 400; otherwise bubble up
    if (err instanceof z.ZodError) {
      res.status(400).json({error: "BadRequest", details: err.issues});
      return;
    }
    next(err);
  }
};
