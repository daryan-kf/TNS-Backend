import {Request, Response} from "express";
import {bq, fq, BQ} from "@/src/config/bigquery";
import {Team} from "@/types";

export const getTeam = async (req: Request, res: Response) => {
  try {
    const {teamId} = req.params;
    console.log(`📊 Fetching data for team: ${teamId}`);

    const query = `
      SELECT 
        team_id,
        name,
        organisation,
        created,
        modified
      FROM ${fq(BQ.sports.dataset!, "teams")}
      WHERE team_id = @teamId
    `;

    const options = {
      query,
      params: {teamId},
    };

    const [rows] = await bq.query(options);

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Team not found",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const team: Team = {
      team_id: rows[0].team_id,
      name: rows[0].name,
      organisation: rows[0].organisation,
      created: rows[0].created?.value || rows[0].created,
      modified: rows[0].modified?.value || rows[0].modified,
    };

    res.json({
      success: true,
      message: "Team data retrieved successfully!",
      data: team,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error fetching team:", errorMessage);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching team.",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
};
