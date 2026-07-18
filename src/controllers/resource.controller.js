const { db } = require("../config/db");
const { ObjectId } = require("mongodb");

const collectionName = "resources";

// Create a new resource
const createResource = async (req, res, next) => {
  try {
    const { title, shortDescription, description, category, level, image, tags, createdBy } = req.body;

    const newResource = {
      title,
      shortDescription,
      description,
      category,
      level,
      image,
      tags: tags || [],
      createdBy,
      createdAt: new Date(),
    };

    const result = await db.collection(collectionName).insertOne(newResource);
    
    res.status(201).json({
      message: "Resource created successfully",
      resource: { ...newResource, _id: result.insertedId },
    });
  } catch (error) {
    next(error);
  }
};

// Get all resources
const getResources = async (req, res, next) => {
  try {
    const { title, category, level, page = 1, limit = 10 } = req.query;

    const query = {};

    if (title) {
      // Escape regex characters to prevent ReDoS (Regex Denial of Service)
      const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedTitle, $options: "i" };
    }
    
    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    // Prevent NaN by falling back to defaults if parsing fails, and prevent negative/zero values
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const resources = await db
      .collection(collectionName)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    const totalResources = await db.collection(collectionName).countDocuments(query);
    const totalPages = Math.ceil(totalResources / limitNum);

    res.status(200).json({
      resources,
      totalResources,
      totalPages,
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// Get resource by ID
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid resource ID format" });
    }

    const resource = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json(resource);
  } catch (error) {
    next(error);
  }
};

// Delete resource by ID
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid resource ID format" });
    }

    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  deleteResource,
};
