const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler caught an error:", err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    error: message,
    // Provide stack trace only in non-production environments
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = errorHandler;
