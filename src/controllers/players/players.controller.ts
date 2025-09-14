import {Request, Response} from "express";
import {
  successResponse,
  notFoundResponse,
  internalServerErrorResponse,
} from "@/src/utils/responses";
import {logger} from "@/src/utils/logger";
import mockData from "@/mochData.json";

const mockPlayersData = mockData.playersData;

/**
 * Get all players
 * GET /players
 */
export const getAllPlayers = (req: Request, res: Response) => {
  try {
    logger.info("Retrieving all players", {
      count: mockPlayersData.length,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    return successResponse(
      res,
      "All players retrieved successfully",
      mockPlayersData,
      mockPlayersData.length
    );
  } catch (error: any) {
    logger.error("Failed to retrieve all players", {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to retrieve players");
  }
};

/**
 * Get player by ID
 * GET /players/:id
 */
export const getPlayerById = (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    logger.info("Retrieving player by ID", {
      playerId: id,
      ip: req.ip,
    });

    const player = mockPlayersData.find(p => p.player_id === id);

    if (!player) {
      logger.warn("Player not found", {
        playerId: id,
        ip: req.ip,
      });

      return notFoundResponse(res, "Player");
    }

    logger.info("Player retrieved successfully", {
      playerId: id,
      playerName: player.name,
      ip: req.ip,
    });

    return successResponse(res, "Player retrieved successfully", player);
  } catch (error: any) {
    logger.error("Failed to retrieve player by ID", {
      error: error.message,
      playerId: req.params.id,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Failed to retrieve player");
  }
};

/**
 * Search players by name
 * GET /players/search?query=name
 */
export const searchPlayers = (req: Request, res: Response) => {
  try {
    const {query} = req.query as {query?: string};
    const searchQuery = query?.toLowerCase().trim() || "";

    logger.info("Searching players", {
      searchQuery: searchQuery || "No query provided",
      ip: req.ip,
    });

    // Filter players based on the search query
    const players =
      searchQuery.length === 0
        ? mockPlayersData // Return all players if no query is provided
        : mockPlayersData.filter(player =>
            player.name.toLowerCase().includes(searchQuery)
          );

    logger.info("Player search completed", {
      searchQuery,
      resultCount: players.length,
      ip: req.ip,
    });

    return successResponse(
      res,
      `Player search completed. Found ${players.length} player(s)`,
      {
        query: searchQuery,
        results: players,
        summary: {
          searchTerm: searchQuery,
          totalResults: players.length,
          searched: mockPlayersData.length,
        },
      },
      players.length
    );
  } catch (error: any) {
    logger.error("Failed to search players", {
      error: error.message,
      searchQuery: req.query.query,
      ip: req.ip,
    });

    return internalServerErrorResponse(res, "Player search failed");
  }
};

/**
 * Get player summary stats
 * GET /players/:id/summary
 */
export const getPlayerSummary = (req: Request, res: Response) => {
  try {
    const {id} = req.params;

    logger.info("Retrieving player summary", {
      playerId: id,
      ip: req.ip,
    });

    const player = mockPlayersData.find(p => p.player_id === id);

    if (!player) {
      return notFoundResponse(res, "Player");
    }

    // Create a condensed summary of key player metrics
    const summary = {
      playerId: player.player_id,
      name: player.name,
      currentStatus: {
        recoveryScore: player.recovery_status.score,
        recoveryTrend: player.recovery_status.trend,
        lastSessionDate: player.latest_session.timestamp,
      },
      recentPerformance: {
        lastSessionLoad: player.latest_session.load_score,
        lastSessionFatigue: player.latest_session.fatigue_score,
        avgHeartRate: player.latest_session.avg_hr,
        maxHeartRate: player.latest_session.max_hr,
      },
      weeklyOverview: {
        totalSessions: player.weekly_summary.total_sessions,
        avgLoadScore: player.weekly_summary.avg_load_score,
        avgFatigueScore: player.weekly_summary.avg_fatigue_score,
        trend: player.weekly_summary.recovery_trend,
      },
    };

    return successResponse(
      res,
      "Player summary retrieved successfully",
      summary
    );
  } catch (error: any) {
    logger.error("Failed to retrieve player summary", {
      error: error.message,
      playerId: req.params.id,
      ip: req.ip,
    });

    return internalServerErrorResponse(
      res,
      "Failed to retrieve player summary"
    );
  }
};
