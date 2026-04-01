const { Wallet, User, Transaction } = require("../../models");
const {
  VALIDATION_RULES,
  TRANSACTION_TYPES,
} = require("../constants/transactionTypes");
const { ERROR_MESSAGES } = require("../constants/errorMessages");

class WalletService {
  /**
   * Get user wallet with balance
   */
  static async getWalletByUserId(userId, transaction = null) {
    try {
      const wallet = await Wallet.findOne({
        where: { userId },
        ...(transaction && { transaction }),
      });

      if (!wallet) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      return wallet;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if user has sufficient balance
   */
  static async hasSufficientBalance(userId, amount, transaction = null) {
    try {
      const wallet = await this.getWalletByUserId(userId, transaction);
      return wallet.balance >= amount;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wallet balance (formatted)
   */
  static async getBalance(userId) {
    try {
      const wallet = await this.getWalletByUserId(userId);
      return {
        balance: wallet.balance,
        formattedBalance: wallet.rupiahFormat,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update wallet balance with transaction record
   * CRITICAL FIX: Properly handle balance updates with transaction records
   */
  static async createTransaction(
    walletId,
    amount,
    type,
    description,
    direction,
    dbTransaction = null,
  ) {
    try {
      // Lock wallet for consistency
      const wallet = await Wallet.findByPk(walletId, {
        lock: true,
        ...(dbTransaction && { transaction: dbTransaction }),
      });

      if (!wallet) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      // Validate balance for debit
      if (type === TRANSACTION_TYPES.DEBIT && wallet.balance < amount) {
        throw new Error(
          `${ERROR_MESSAGES.INSUFFICIENT_BALANCE}. Available: Rp ${wallet.balance}`,
        );
      }

      // Create transaction record
      const transactionRecord = await Transaction.create(
        {
          walletId,
          amount,
          type,
          description,
          direction,
        },
        { transaction: dbTransaction },
      );

      // Update wallet balance explicitly (don't rely on hook!)
      // This is CRITICAL FIX for balance update issue
      if (type === TRANSACTION_TYPES.DEBIT) {
        wallet.balance -= amount;
      } else if (type === TRANSACTION_TYPES.CREDIT) {
        wallet.balance += amount;
      }

      await wallet.save({ transaction: dbTransaction });

      return {
        transaction: transactionRecord,
        newBalance: wallet.balance,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get wallet transactions with pagination
   */
  static async getTransactions(
    userId,
    { page = 1, limit = 10, sort = "createdAt", order = "DESC" } = {},
  ) {
    try {
      const wallet = await this.getWalletByUserId(userId);

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await Transaction.findAndCountAll({
        where: { walletId: wallet.id },
        order: [[sort, order]],
        limit: parseInt(limit),
        offset,
        include: [{ association: "wallet" }],
      });

      return {
        count,
        transactions: rows,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search wallets by balance range
   */
  static async searchByBalanceRange(minBalance, maxBalance) {
    try {
      const { Op } = require("sequelize");

      return await Wallet.findAll({
        where: {
          balance: {
            [Op.gte]: parseInt(minBalance),
            [Op.lte]: parseInt(maxBalance),
          },
        },
        include: [
          {
            association: "user",
            attributes: { exclude: ["password"] },
          },
        ],
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = WalletService;
