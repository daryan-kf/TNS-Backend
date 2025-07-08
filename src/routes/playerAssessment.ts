import {Router} from "express";
import {addPlayerAssessment} from "../controllers/playerAssessment";

const router = Router();

// POST route for physio to add player assessment
router.post("/assessment", addPlayerAssessment);

export default router;
