const express = require("express");
const {
  createResource,
  getResources,
  getResourceById,
  deleteResource,
} = require("../controllers/resource.controller");
const { validateResourceCreation } = require("../middleware/validateResource");

const router = express.Router();

router.post("/", validateResourceCreation, createResource);
router.get("/", getResources);
router.get("/:id", getResourceById);
router.delete("/:id", deleteResource);

module.exports = router;