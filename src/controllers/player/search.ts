import {Request, Response} from "express";
import mockData from "../../../mochData.json";

const mockPlayersData = mockData.playersData;

export const searchPlayers = (req: Request, res: Response) => {
  const {query} = req.query;
  console.log("🔍 Searching for players with query:", query);

  const players = mockPlayersData.filter(player =>
    player.name.toLowerCase().includes(query?.toString().toLowerCase() || "")
  );

  res.json({
    success: true,
    message: "Players searched successfully!",
    data: players,
    timestamp: new Date().toISOString(),
  });
};
