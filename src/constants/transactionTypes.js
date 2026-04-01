// Transaction Type Constants
const TRANSACTION_TYPES = {
  DEBIT: "debit",
  CREDIT: "credit",
};

const TRANSACTION_DIRECTIONS = {
  TRANSFER_OUT: "transfer_out",
  TRANSFER_IN: "transfer_in",
  PAYMENT: "payment",
  TOP_UP: "top_up",
};

const TRANSFER_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

const VALIDATION_RULES = {
  MIN_TRANSFER: 1000,
  MIN_PAYMENT: 10000,
  INITIAL_BALANCE: 100000,
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 100,
};

module.exports = {
  TRANSACTION_TYPES,
  TRANSACTION_DIRECTIONS,
  TRANSFER_STATUS,
  USER_ROLES,
  VALIDATION_RULES,
};
