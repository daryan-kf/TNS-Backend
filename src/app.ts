import express from "express";
import playerRoutes from "./routes/player";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Existing routes
app.get("/", (req, res) => {
  console.log("🏠 Home route accessed!");
  res.json({
    message: "TNS Backend Server Running!",
    timestamp: new Date().toISOString(),
  });
});

// Player routes
app.use("/players", playerRoutes);

// Start server
app.listen(PORT, () => {
  console.log("🚀 TNS Backend Server running on port 3000");
  console.log("🌐 Visit: http://localhost:3000");
});
