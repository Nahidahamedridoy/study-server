const express = require("express");
const { chatWithAI, generateStudyPlan, getChatHistory } = require("../controllers/ai.controller");

const router = express.Router();

router.post("/chat", chatWithAI);
router.post("/study-plan", generateStudyPlan);
router.get("/history", getChatHistory);

module.exports = router;