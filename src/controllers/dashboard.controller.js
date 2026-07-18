const { db } = require("../config/db");

const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Get total resources count
    const totalResources = await db.collection("resources").estimatedDocumentCount();

    // 2. Get total unique categories count using aggregation
    const categoriesAggregation = await db.collection("resources").aggregate([
      { $group: { _id: "$category" } },
      { $count: "totalCategories" }
    ]).toArray();
    
    const totalCategories = categoriesAggregation.length > 0 ? categoriesAggregation[0].totalCategories : 0;

    // 3. Get total AI chats count
    const totalAIChats = await db.collection("chats").estimatedDocumentCount();

    res.status(200).json({
      totalResources,
      totalCategories,
      totalAIChats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
