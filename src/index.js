require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const resourceRoutes = require("./routes/resource.routes");
const aiRoutes = require("./routes/ai.routes");
const homeRoutes = require("./routes/home.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const studyPlanRoutes = require("./routes/studyPlan.routes");

const { connectDB } = require("./config/db");

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 StudyMate AI Server Running");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/study-plans", studyPlanRoutes);

// Global Error Handler
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();