import {Request, Response} from "express";

// Interface for player assessment data
interface PlayerAssessmentData {
  rangeOfMotion: string;
  strengthLevels: string;
  balanceAndStability: string;
  endurance: string;
  speedAndAgility: string;
}

// POST - Add new player assessment
export const addPlayerAssessment = (req: Request, res: Response) => {
  const {id} = req.params;
  const assessmentData: PlayerAssessmentData = req.body;

  // Log assessment data
  console.log({playerId: id, assessmentData});

  // TODO: Also send to BigQuery for analytics
  // const bigQueryResult = await bigQueryClient
  //   .dataset('player_analytics')
  //   .table('assessments')
  //   .insert([{...assessmentData, player_id: id}]);

  // Send response back to frontend
  res.json({
    success: true,
    message: "Player assessment data received successfully!",
    data: assessmentData,
    playerId: id,
    timestamp: new Date().toISOString(),
  });
};

// GET - Fetch player assessment
export const getPlayerAssessment = (req: Request, res: Response) => {
  const {id, assessmentId} = req.params;

  console.log(
    `Fetching assessment for player: ${id} and assessment: ${assessmentId}`
  );
  // Mock response for now
  const mockAssessmentData: PlayerAssessmentData = {
    rangeOfMotion: "Excellent",
    strengthLevels: "High",
    balanceAndStability: "Good",
    endurance: "Very Good",
    speedAndAgility: "Excellent",
  };

  res.json({
    success: true,
    message: "Player assessment retrieved successfully!",
    data: mockAssessmentData,
    playerId: id,
    timestamp: new Date().toISOString(),
  });
};

// PUT/PATCH - Update player assessment
export const updatePlayerAssessment = (req: Request, res: Response) => {
  const {id, assessmentId} = req.params;
  const updatedAssessmentData: Partial<PlayerAssessmentData> = req.body;

  res.json({
    success: true,
    message: "Player assessment updated successfully!",
    data: updatedAssessmentData,
    playerId: id,
    timestamp: new Date().toISOString(),
  });
};
