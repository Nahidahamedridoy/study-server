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

app.use(cors());
app.use(express.json());

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

// Global Error Handler Middleware
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();