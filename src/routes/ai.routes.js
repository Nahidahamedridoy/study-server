const express = require("express");
const { chatWithAI, generateStudyPlan } = require("../controllers/ai.controller");

const router = express.Router();

router.post("/chat", chatWithAI);
router.post("/study-plan", generateStudyPlan);

module.exports = router;