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

  // TODO: Implement Supabase fetch
  // const { data, error } = await supabase
  //   .from('player_assessments')
  //   .select('*')
  //   .eq('player_id', id)
  //   .order('created_at', { ascending: false })
  //   .limit(1)
  //   .single();

  // TODO: Handle error cases
  // if (error) {
  //   return res.status(404).json({
  //     success: false,
  //     message: "Assessment not found",
  //     error: error.message
  //   });
  // }

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

  console.log({
    playerId: id,
    assessmentId,
    updatedData: updatedAssessmentData,
  });

  // TODO: Handle error cases
  // if (error) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Failed to update assessment",
  //     error: error.message
  //   });
  // }

  // TODO: Update BigQuery record as well
  // const bigQueryUpdate = await bigQueryClient
  //   .dataset('player_analytics')
  //   .table('assessments')
  //   .update({...updatedAssessmentData, player_id: id});

  res.json({
    success: true,
    message: "Player assessment updated successfully!",
    data: updatedAssessmentData,
    playerId: id,
    timestamp: new Date().toISOString(),
  });
};
