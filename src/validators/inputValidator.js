const { VALIDATION_RULES } = require("../constants/transactionTypes");
const { ERROR_MESSAGES } = require("../constants/errorMessages");

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return (
    password &&
    password.length >= VALIDATION_RULES.MIN_PASSWORD_LENGTH &&
    password.length <= 255
  );
};

const validateName = (name) => {
  return (
    name &&
    name.length >= VALIDATION_RULES.MIN_NAME_LENGTH &&
    name.length <= VALIDATION_RULES.MAX_NAME_LENGTH
  );
};

const validateAmount = (amount, minAmount = 0) => {
  const parsedAmount = parseInt(amount, 10);
  return !isNaN(parsedAmount) && parsedAmount >= minAmount;
};

const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  return phone.length >= 10 && phone.length <= 15;
};

// Validators
const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || !validateName(data.name)) {
    errors.push(ERROR_MESSAGES.NAME_LENGTH);
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push(ERROR_MESSAGES.INVALID_EMAIL);
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push(ERROR_MESSAGES.PASSWORD_MIN_LENGTH);
  }

  if (data.password !== data.passwordConfirm) {
    errors.push(ERROR_MESSAGES.PASSWORDS_NOT_MATCH);
  }

  if (data.phone && !validatePhoneNumber(data.phone)) {
    errors.push("Phone number must be between 10 and 15 digits");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = [];

  if (!data.email || !validateEmail(data.email)) {
    errors.push(ERROR_MESSAGES.INVALID_EMAIL);
  }

  if (!data.password) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateTransfer = (data) => {
  const errors = [];

  const receiverId = parseInt(data.receiverId, 10);
  if (!receiverId || receiverId <= 0) {
    errors.push(ERROR_MESSAGES.INVALID_RECEIVER_ID);
  }

  if (!validateAmount(data.amount, VALIDATION_RULES.MIN_TRANSFER)) {
    errors.push(ERROR_MESSAGES.MIN_TRANSFER_AMOUNT);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validatePayment = (data) => {
  const errors = [];

  const merchantId = parseInt(data.merchantId, 10);
  if (!merchantId || merchantId <= 0) {
    errors.push("Invalid merchant ID");
  }

  if (!validateAmount(data.amount, VALIDATION_RULES.MIN_PAYMENT)) {
    errors.push(ERROR_MESSAGES.MIN_PAYMENT_AMOUNT);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAmount,
  validatePhoneNumber,
  validateRegistration,
  validateLogin,
  validateTransfer,
  validatePayment,
};
