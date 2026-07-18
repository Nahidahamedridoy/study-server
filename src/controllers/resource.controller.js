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
    const { search, category, level, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      // Escape regex characters to prevent ReDoS
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Search in both title and shortDescription
      query.$or = [
        { title: { $regex: escapedSearch, $options: "i" } },
        { shortDescription: { $regex: escapedSearch, $options: "i" } },
      ];
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

// Update resource by ID
const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid resource ID format" });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Prevent updating immutable fields
    delete updateData._id;
    delete updateData.createdAt;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();

    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json({
      message: "Resource updated successfully",
      resource: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get related resources by category
const getRelatedResources = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { excludeId, limit = 4 } = req.query;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const query = { category };
    
    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const limitNum = Math.max(1, parseInt(limit, 10) || 4);

    const relatedResources = await db
      .collection(collectionName)
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .toArray();

    res.status(200).json(relatedResources);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  deleteResource,
  updateResource,
  getRelatedResources,
};
