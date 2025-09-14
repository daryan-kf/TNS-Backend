import {Request, Response} from "express";
import {bq, fq, BQ} from "@/src/config/bigquery";
import {Team} from "@/types";

export const getAllTeams = async (req: Request, res: Response) => {
  try {
    console.log("📊 Fetching all teams data!");

    const query = `
      SELECT 
        team_id,
        name,
        organisation,
        created,
        modified
      FROM ${fq(BQ.sports.dataset!, "teams")}
      ORDER BY name ASC
    `;

    const [rows] = await bq.query(query);

    const teams: Team[] = rows.map((row: any) => ({
      team_id: row.team_id,
      name: row.name,
      organisation: row.organisation,
      created: row.created?.value || row.created,
      modified: row.modified?.value || row.modified,
    }));

    res.json({
      success: true,
      message: "Teams data retrieved successfully!",
      data: teams,
      count: teams.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching teams:", errorMessage);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching teams.",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
};
