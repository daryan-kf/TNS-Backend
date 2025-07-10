import {Request, Response} from "express";
import mockData from "@/mochData.json";

const mockPlayersData = mockData.playersData;
// GET method to retrieve all player data
export const getAllPlayers = (req: Request, res: Response) => {
  console.log("📊 Fetching all player  data!");

  res.json({
    success: true,
    message: "Player  data retrieved successfully!",
    data: mockPlayersData,
    count: mockPlayersData.length,
    timestamp: new Date().toISOString(),
  });
};

// GET method to retrieve specific player data
export const getPlayerById = (req: Request, res: Response) => {
  const {id} = req.params;
  console.log(`📊 Fetching data for player: ${id}`);

  const player = mockPlayersData.find(p => p.player_id === id);

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
    message: "Player data retrieved successfully!",
    data: player,
    timestamp: new Date().toISOString(),
  });
};
