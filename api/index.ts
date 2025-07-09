import express from "express";
import cors from "cors";
import playerRoutes from "../src/routes/player";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  console.log("🏠 TNS Backend API - Home route accessed!");
  res.json({
    message: "TNS Backend API Running on Vercel! 🚀",
    timestamp: new Date().toISOString(),
    routes: [
      "GET /",
      "POST /player/assessment",
      "GET /player/performance",
      "GET /player/performance/:playerId",
    ],
  });
});

// Player routes - Use app.use() to handle all HTTP methods
app.use("/player", playerRoutes);

// Export for Vercel
export default app;
