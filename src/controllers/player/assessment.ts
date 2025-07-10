import {Request, Response} from "express";

// Interface for player assessment data
interface PlayerAssessmentData {
  rangeOfMotion: string;
  strengthLevels: string;
  balanceAndStability: string;
  endurance: string;
  speedAndAgility: string;
}

export const addPlayerAssessment = (req: Request, res: Response) => {
  const assessmentData: PlayerAssessmentData = req.body;

  // Log each field nicely
  console.log({assessmentData});

  // Send response back to frontend
  res.json({
    success: true,
    message: "Player assessment data received successfully!",
    data: assessmentData,
    timestamp: new Date().toISOString(),
  });
};
