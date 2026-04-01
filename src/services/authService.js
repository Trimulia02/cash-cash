const { User } = require("../../models");
const bcrypt = require("bcryptjs");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require("../constants/errorMessages");
const { USER_ROLES } = require("../constants/transactionTypes");
const {
  validateEmail,
  validatePassword,
} = require("../validators/inputValidator");

class AuthService {
  /**
   * Register new user
   */
  static async registerUser(userData) {
    try {
      const { name, email, password, phone } = userData;

      // Check email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED);
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password, // Will be hashed by User model hook
        phone,
        role: USER_ROLES.USER,
        isActive: true,
      });

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  static async loginUser(email, password) {
    try {
      // Find user with wallet
      const user = await User.findOne({
        where: { email },
        include: [{ association: "wallet" }],
      });

      if (!user) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Verify password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error(ERROR_MESSAGES.ACCOUNT_DEACTIVATED);
      }

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile with wallet and transactions
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ["password"] },
        include: [
          {
            association: "wallet",
            include: [
              {
                association: "transactions",
                attributes: [
                  "id",
                  "amount",
                  "type",
                  "description",
                  "direction",
                  "createdAt",
                ],
                order: [["createdAt", "DESC"]],
                limit: 5, // Latest 5 transactions untuk dashboard preview
              },
            ],
          },
          {
            association: "sentTransfers",
            attributes: ["id", "amount", "createdAt"],
            include: [
              {
                association: "receiver",
                attributes: ["id", "name"],
              },
            ],
          },
          {
            association: "receivedTransfers",
            attributes: ["id", "amount", "createdAt"],
            include: [
              {
                association: "sender",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all active users (for transfer recipient list)
   */
  static async getAllActiveUsers(excludeUserId = null) {
    try {
      const { Op } = require("sequelize");

      const whereClause = { isActive: true };
      if (excludeUserId) {
        whereClause.id = {
          [Op.ne]: excludeUserId,
        };
      }

      return await User.findAll({
        where: whereClause,
        attributes: { exclude: ["password"] },
        include: [{ association: "wallet", attributes: ["balance"] }],
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
