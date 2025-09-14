import {Request, Response} from "express";
import {bq, fq, BQ} from "@/src/config/bigquery";
import {TeamPlayer} from "@/types";

export const getAllPlayersWithinTeam = async (req: Request, res: Response) => {
  try {
    const {teamId} = req.params;
    console.log(`�� Fetching all players for team: ${teamId}`);

    const query = `
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
      WHERE team_id = @teamId
      ORDER BY player_number ASC, last_name ASC
    `;

    const options = {
      query,
      params: {teamId},
    };

    const [rows] = await bq.query(options);

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

    res.json({
      success: true,
      message: `Players for team ${teamId} retrieved successfully!`,
      data: players,
      count: players.length,
      team_id: teamId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching players for team:", errorMessage);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching players for team.",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
};
