const express = require("express");
const { chatWithAI, generateStudyPlan, getChatHistory, updateReaction, deleteChatHistory } = require("../controllers/ai.controller");

const router = express.Router();

router.post("/chat", chatWithAI);
router.post("/study-plan", generateStudyPlan);
router.get("/history", getChatHistory);
router.patch("/history/:id/reaction", updateReaction);
router.delete("/history/:id", deleteChatHistory);

module.exports = router;