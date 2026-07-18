const { db } = require("../config/db");

const collectionName = "study_plans";

const getStudyPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const plans = await db
      .collection(collectionName)
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudyPlans,
};
