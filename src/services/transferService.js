const { sequelize, User, Wallet, Transfer, Transaction } = require("../../models");
const { TRANSACTION_TYPES, TRANSFER_STATUS, VALIDATION_RULES } = require("../constants/transactionTypes");
const { ERROR_MESSAGES } = require("../constants/errorMessages");
const WalletService = require("./walletService");

class TransferService {
  /**
   * Create a transfer between two users
   * CRITICAL FIX: Ensure atomic operations with proper transaction handling
   */
  static async createTransfer(senderId, receiverId, amount) {
    const dbTransaction = await sequelize.transaction();

    try {
      // Validate amount
      if (amount < VALIDATION_RULES.MIN_TRANSFER) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.MIN_TRANSFER_AMOUNT);
      }

      // Check if sender and receiver are different
      if (senderId === receiverId) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.CANNOT_TRANSFER_TO_SELF);
      }

      // Validate users exist
      const sender = await User.findByPk(senderId, { transaction: dbTransaction });
      const receiver = await User.findByPk(receiverId, { transaction: dbTransaction });

      if (!sender) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.SENDER_NOT_FOUND);
      }

      if (!receiver) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.RECEIVER_NOT_FOUND);
      }

      // Get wallets with locks
      const senderWallet = await Wallet.findOne(
        {
          where: { userId: senderId },
          lock: true,
        },
        { transaction: dbTransaction }
      );

      const receiverWallet = await Wallet.findOne(
        {
          where: { userId: receiverId },
          lock: true,
        },
        { transaction: dbTransaction }
      );

      if (!senderWallet) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      if (!receiverWallet) {
        await dbTransaction.rollback();
        throw new Error(ERROR_MESSAGES.WALLET_NOT_FOUND);
      }

      // Check balance using wallet service
      if (senderWallet.balance < amount) {
        await dbTransaction.rollback();
        throw new Error(
          `${ERROR_MESSAGES.INSUFFICIENT_BALANCE}. Available: Rp ${senderWallet.balance}`
        );
      }

      // Create transfer record
      const transfer = await Transfer.create(
        {
          senderId,
          receiverId,
          amount,
          status: TRANSFER_STATUS.COMPLETED,
        },
        { transaction: dbTransaction }
      );

      // Create debit transaction for sender
      await Transaction.create(
        {
          walletId: senderWallet.id,
          amount,
          type: TRANSACTION_TYPES.DEBIT,
          direction: `Transfer to ${receiver.name}`,
          description: `Transfer to ${receiver.name} (ID: ${receiver.id})`,
        },
        { transaction: dbTransaction }
      );

      // Create credit transaction for receiver
      await Transaction.create(
        {
          walletId: receiverWallet.id,
          amount,
          type: TRANSACTION_TYPES.CREDIT,
          direction: `Transfer from ${sender.name}`,
          description: `Transfer from ${sender.name} (ID: ${sender.id})`,
        },
        { transaction: dbTransaction }
      );

      // Update wallet balances explicitly (CRITICAL FIX!)
      senderWallet.balance -= amount;
      receiverWallet.balance += amount;

      await senderWallet.save({ transaction: dbTransaction });
      await receiverWallet.save({ transaction: dbTransaction });

      // Commit transaction
      await dbTransaction.commit();

      return {
        transferId: transfer.id,
        from: sender.name,
        to: receiver.name,
        amount,
        status: transfer.status,
        senderNewBalance: senderWallet.balance,
        receiverNewBalance: receiverWallet.balance,
      };
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Get transfer history for a user
   */
  static async getTransferHistory(userId, { page = 1, limit = 10 } = {}) {
    try {
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await Transfer.findAndCountAll({
        where: {
          [require("sequelize").Op.or]: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
        include: [
          {
            association: "sender",
            attributes: { exclude: ["password"] },
          },
          {
            association: "receiver",
            attributes: { exclude: ["password"] },
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: parseInt(limit),
        offset,
      });

      return {
        count,
        transfers: rows,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single transfer details
   */
  static async getTransferById(transferId) {
    try {
      const transfer = await Transfer.findByPk(transferId, {
        include: [
          {
            association: "sender",
            attributes: { exclude: ["password"] },
          },
          {
            association: "receiver",
            attributes: { exclude: ["password"] },
          },
        ],
      });

      if (!transfer) {
        throw new Error(ERROR_MESSAGES.TRANSFER_NOT_FOUND);
      }

      return transfer;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TransferService;
