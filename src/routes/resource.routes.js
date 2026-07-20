const express = require("express");
const {
  createResource,
  getResources,
  getMyResources,
  getResourceById,
  deleteResource,
  updateResource,
  getRelatedResources,
} = require("../controllers/resource.controller");
const { validateResourceCreation } = require("../middleware/validateResource");

const router = express.Router();

router.post("/", validateResourceCreation, createResource);
router.get("/", getResources);
router.get("/my", getMyResources);
router.get("/related/:category", getRelatedResources);
router.get("/:id", getResourceById);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

module.exports = router;