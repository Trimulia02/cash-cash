// Simple validators
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateName = (name) => {
  return name && name.length >= 3 && name.length <= 100;
};

const validateAmount = (amount) => {
  return parseInt(amount) > 0;
};

const validatePhoneNumber = (phone) => {
  if (!phone) return true;
  return phone.length >= 10 && phone.length <= 15;
};

const validateRegistration = (data) => {
  const errors = [];
  if (!validateName(data.name)) errors.push("Name must be 3-100 characters");
  if (!validateEmail(data.email)) errors.push("Invalid email");
  if (!validatePassword(data.password))
    errors.push("Password min 6 characters");
  if (data.password !== data.passwordConfirm)
    errors.push("Passwords don't match");
  if (!validatePhoneNumber(data.phone)) errors.push("Invalid phone number");

  return { isValid: errors.length === 0, errors };
};

const validateLogin = (data) => {
  const errors = [];
  if (!data.email || !validateEmail(data.email)) errors.push("Invalid email");
  if (!data.password) errors.push("Password required");

  return { isValid: errors.length === 0, errors };
};

const validateTransfer = (data) => {
  const errors = [];
  if (!data.receiverId || data.receiverId < 1)
    errors.push("Invalid receiver ID");
  if (!validateAmount(data.amount)) errors.push("Invalid amount");

  return { isValid: errors.length === 0, errors };
};

const validatePayment = (data) => {
  const errors = [];
  if (!data.merchantId || data.merchantId < 1) errors.push("Invalid merchant");
  if (!validateAmount(data.amount)) errors.push("Invalid amount");

  return { isValid: errors.length === 0, errors };
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
