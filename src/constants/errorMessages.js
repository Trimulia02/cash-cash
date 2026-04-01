// Error Messages Constants
const ERROR_MESSAGES = {
  // Auth
  AUTH_REQUIRED: "Authentication required",
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_DEACTIVATED: "Account is deactivated",
  EMAIL_ALREADY_REGISTERED: "Email already registered",
  PASSWORDS_NOT_MATCH: "Passwords do not match",
  ALL_FIELDS_REQUIRED: "All fields a re required",
  LOGIN_FAILED: "Login failed",
  EMAIL_PASSWORD_REQUIRED: "Email and password required",

  // Validation
  INVALID_EMAIL: "Must be a valid email address",
  NAME_REQUIRED: "Name is required",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
  NAME_LENGTH: "Name must be between 3 and 100 characters",

  // Wallet
  WALLET_NOT_FOUND: "Wallet not found",
  INSUFFICIENT_BALANCE: "Insufficient balance",

  // Transfer
  RECEIVER_NOT_FOUND: "Receiver not found",
  TRANSFER_NOT_FOUND: "Transfer not found",
  CANNOT_TRANSFER_TO_SELF: "Cannot transfer to yourself",
  INVALID_RECEIVER_ID: "Invalid receiver ID",
  INVALID_TRANSFER_AMOUNT: "Invalid transfer amount",
  MIN_TRANSFER_AMOUNT: "Minimum transfer amount is Rp 1.000",
  TRANSFER_FAILED: "Transfer failed",

  // Payment
  MERCHANT_NOT_FOUND: "Merchant not found",
  INVALID_PAYMENT_AMOUNT: "Invalid payment amount",
  MIN_PAYMENT_AMOUNT: "Minimum payment amount is Rp 10.000",
  PAYMENT_FAILED: "Payment failed",

  // User
  USER_NOT_FOUND: "User not found",
  SENDER_NOT_FOUND: "Sender not found",

  // General
  INVALID_INPUT: "Invalid input",
  INTERNAL_SERVER_ERROR: "Internal server error",
  PAGE_NOT_FOUND: "Page not found",
  SOMETHING_WENT_WRONG: "Something went wrong",
};

const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESSFUL: "Registration successful",
  LOGIN_SUCCESSFUL: "Login successful",
  LOGOUT_SUCCESSFUL: "Logout successful",
  TRANSFER_SUCCESSFUL: "Transfer successful",
  PAYMENT_SUCCESSFUL: "Payment successful",
  ACCOUNT_UPDATED: "Account updated successfully",
};

module.exports = {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
