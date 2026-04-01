const {
  sequelize,
  Wallet,
  Merchant,
  Payment,
  Transaction,
} = require("../../models");
const {
  TRANSACTION_TYPES,
  VALIDATION_RULES,
} = require("../constants/transactionTypes");
const { ERROR_MESSAGES } = require("../constants/errorMessages");

class PaymentService {
  /**
   * Create a payment to merchant
   * CRITICAL FIX: Ensure atomic operations with proper transaction handling
   */
  static async createPayment(userId, merchantId, amount) {
    const dbTransaction = await sequelize.transaction();

    try {
      // Validate amount
      if (amount < VALIDATION_RULES.MIN_PAYMENT) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.MIN_PAYMENT_AMOUNT);
      }

      // Get wallet with lock
      const wallet = await Wallet.findOne(
        {
          where: { userId },
          lock: true,
        },
        { transaction: dbTransaction },
      );

      if (!wallet) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      // Check merchant exists
      const merchant = await Merchant.findByPk(merchantId, {
        transaction: dbTransaction,
      });

      if (!merchant) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.MERCHANT_NOT_FOUND);
      }

      // Check balance
      if (wallet.balance < amount) {
        await dbTransaction.rollback();
        throw new Error(
          `${ERROR_MESSAGES.INSUFFICIENT_BALANCE}. Available: Rp ${wallet.balance}`,
        );
      }

      // Create payment record
      const payment = await Payment.create(
        {
          walletId: wallet.id,
          merchantId,
          amount,
        },
        { transaction: dbTransaction },
      );

      // Create transaction record
      await Transaction.create(
        {
          walletId: wallet.id,
          amount,
          type: TRANSACTION_TYPES.DEBIT,
          direction: merchant.name,
          description: `Payment to ${merchant.name}`,
        },
        { transaction: dbTransaction },
      );

      // Update wallet balance explicitly (CRITICAL FIX!)
      wallet.balance -= amount;
      await wallet.save({ transaction: dbTransaction });

      // Commit transaction
      await dbTransaction.commit();

      return {
        paymentId: payment.id,
        merchant: merchant.name,
        amount,
        timestamp: payment.createdAt,
        newBalance: wallet.balance,
      };
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(userId, { page = 1, limit = 10 } = {}) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const wallet = await Wallet.findOne({
        where: { userId },
      });

      if (!wallet) {
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      const { count, rows } = await Payment.findAndCountAll({
        where: { walletId: wallet.id },
        include: [
          {
            association: "merchant",
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset,
      });

      return {
        count,
        payments: rows,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PaymentService;
