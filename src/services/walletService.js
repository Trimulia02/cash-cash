const { Wallet, Transaction } = require("../../models");
const { TRANSACTION_TYPES } = require("../constants/transactionTypes");

class WalletService {
  static async getWallet(userId) {
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) throw new Error("Wallet not found");
    return wallet;
  }

  static async createTransaction(
    walletId,
    amount,
    type,
    description,
    direction,
  ) {
    const wallet = await Wallet.findByPk(walletId);

    if (!wallet) throw new Error("Wallet not found");

    if (type === TRANSACTION_TYPES.DEBIT && wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    // Update balance
    if (type === TRANSACTION_TYPES.DEBIT) {
      wallet.balance -= amount;
    } else {
      wallet.balance += amount;
    }

    await wallet.save();

    // Create transaction record
    const txn = await Transaction.create({
      walletId,
      amount,
      type,
      description,
      direction,
    });

    return { transaction: txn, newBalance: wallet.balance };
  }

  static async getTransactions(
    userId,
    page = 1,
    limit = 10,
    sort = "createdAt",
    order = "DESC",
  ) {
    const wallet = await this.getWallet(userId);
    const offset = (page - 1) * limit;

    const { count, rows } = await Transaction.findAndCountAll({
      where: { walletId: wallet.id },
      order: [[sort, order]],
      limit,
      offset,
    });

    return {
      count,
      transactions: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  static async searchByBalanceRange(minBalance, maxBalance) {
    const { Op } = require("sequelize");
    return await Wallet.findAll({
      where: {
        balance: {
          [Op.gte]: minBalance,
          [Op.lte]: maxBalance,
        },
      },
    });
  }
}

module.exports = WalletService;
