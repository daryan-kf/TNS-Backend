import {Request, Response} from "express";
import mockData from "@/mochData.json";

const mockPlayersData = mockData.playersData;
// GET method to retrieve all player performance data
export const getAllPlayersPerformance = (req: Request, res: Response) => {
  console.log("📊 Fetching all player performance data!");

  res.json({
    success: true,
    message: "Player performance data retrieved successfully!",
    data: mockPlayersData,
    count: mockPlayersData.length,
    timestamp: new Date().toISOString(),
  });
};

// GET method to retrieve specific player performance data
export const getPlayerPerformanceById = (req: Request, res: Response) => {
  const {playerId} = req.params;
  console.log(`📊 Fetching performance data for player: ${playerId}`);

  const player = mockPlayersData.find(p => p.player_id === playerId);

  if (!player) {
    res.status(404).json({
      success: false,
      message: "Player not found",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.json({
    success: true,
    message: "Player performance data retrieved successfully!",
    data: player,
    timestamp: new Date().toISOString(),
  });
};
