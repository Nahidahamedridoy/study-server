const { db } = require("../config/db");

const getLatestResources = async (req, res, next) => {
  try {
    const resources = await db
      .collection("resources")
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest
      .limit(8) // Limit to 8
      .toArray();

    res.status(200).json(resources);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLatestResources,
};
