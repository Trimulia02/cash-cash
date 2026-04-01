// Async handler wrapper for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Error handler (to be used as last middleware)
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // 404 Not Found error
  if (err.status === 404) {
    return res.status(404).render("error", {
      title: "Page Not Found",
      message: err.message || "The page you are looking for does not exist",
      error: err,
    });
  }

  // Sequelize validation error
  if (err.name === "SequelizeValidationError") {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).render("error", {
      title: "Validation Error",
      message: messages.join(", "),
      error: err,
    });
  }

  // Sequelize unique constraint error
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0].path;
    return res.status(400).render("error", {
      title: "Duplicate Entry",
      message: `${field} already exists`,
      error: err,
    });
  }

  // Sequelize foreign key error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).render("error", {
      title: "Invalid Reference",
      message: "Referenced record does not exist",
      error: err,
    });
  }

  // Default error
  res.status(err.status || 500).render("error", {
    title: err.title || "Internal Server Error",
    message: err.message || "Something went wrong",
    error: err,
  });
};

module.exports = {
  asyncHandler,
  errorHandler,
};
