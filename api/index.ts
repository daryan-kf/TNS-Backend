import "dotenv/config";
import express from "express";
import cors from "cors";
import playerRoutes from "@/src/routes/player";
import teamRoutes from "@/src/routes/team";

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
  });
});

// Player routes
app.use("/players", playerRoutes);

// Team routes
app.use("/teams", teamRoutes);

// Start server for local development (not on Vercel)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 TNS Backend Server running on port ${PORT}`);
    console.log(`🌐 Visit: http://localhost:${PORT}`);
  });
}

// Export for Vercel
export default app;
