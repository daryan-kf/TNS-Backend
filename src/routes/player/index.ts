import {Router} from "express";
import assessmentRoutes from "./assessment";
import performanceRoutes from "./performance";

const router = Router();

// Mount sub-routers
router.use(assessmentRoutes);
router.use(performanceRoutes);

export default router;
