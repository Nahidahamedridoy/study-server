const validateResourceCreation = (req, res, next) => {
  const { title, shortDescription, description, category, level, createdBy } = req.body;
  const errors = [];

  if (!title || typeof title !== "string") {
    errors.push("Field 'title' is required and must be a string.");
  }
  if (!shortDescription || typeof shortDescription !== "string") {
    errors.push("Field 'shortDescription' is required and must be a string.");
  }
  if (!description || typeof description !== "string") {
    errors.push("Field 'description' is required and must be a string.");
  }
  if (!category || typeof category !== "string") {
    errors.push("Field 'category' is required and must be a string.");
  }
  if (!level || typeof level !== "string") {
    errors.push("Field 'level' is required and must be a string.");
  }
  if (!createdBy || typeof createdBy !== "string") {
    errors.push("Field 'createdBy' is required and must be a string.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: "Validation Failed", 
      details: errors 
    });
  }

  next();
};

module.exports = {
  validateResourceCreation,
};
