import {Request, Response} from "express";
import mockData from "@/mochData.json";
import {Player} from "@/types";

const mockPlayersData = mockData.playersData;

export const searchPlayers = (req: Request, res: Response) => {
  try {
    const {query} = req.query;

    const searchQuery = query?.toString().toLowerCase().trim() || "";

    console.log(
      `🔍 Searching for players with query: "${
        searchQuery || "No query provided"
      }"`
    );

    // Filter players based on the search query
    const players =
      searchQuery.length === 0
        ? mockPlayersData // Return all players if no query is provided
        : mockPlayersData.filter(player =>
            player.name.toLowerCase().includes(searchQuery)
          );

    res.json({
      success: true,
      message: `Players searched successfully! Found ${players.length} player(s).`,
      data: players,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error searching for players:", errorMessage);

    res.status(500).json({
      success: false,
      message: "An error occurred while searching for players.",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
};
