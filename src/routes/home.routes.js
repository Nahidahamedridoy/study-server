const express = require("express");
const { getLatestResources } = require("../controllers/home.controller");

const router = express.Router();

router.get("/resources", getLatestResources);

module.exports = router;
