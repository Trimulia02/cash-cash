// Response helper for consistent API responses
const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
};

const successResponse = (res, message, data = null, statusCode = 200) => {
  sendResponse(res, statusCode, true, message, data);
};

const errorResponse = (res, message, statusCode = 400, data = null) => {
  sendResponse(res, statusCode, false, message, data);
};

// Validation error response
const validationErrorResponse = (res, errors) => {
  const errorMessages = Array.isArray(errors) ? errors : [errors];
  res.status(422).json({
    success: false,
    message: "Validation failed",
    errors: errorMessages,
  });
};

module.exports = {
  sendResponse,
  successResponse,
  errorResponse,
  validationErrorResponse,
};
