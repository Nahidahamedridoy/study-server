const express = require("express");
const { getStudyPlans } = require("../controllers/studyPlan.controller");

const router = express.Router();

router.get("/", getStudyPlans);

module.exports = router;
