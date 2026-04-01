const { Wallet, Merchant, Payment, Transaction } = require("../../models");
const { TRANSACTION_TYPES } = require("../constants/transactionTypes");

class PaymentService {
  static async createPayment(userId, merchantId, amount) {
    if (amount < 10000) throw new Error("Minimum payment is Rp 10.000");

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) throw new Error("Wallet not found");

    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) throw new Error("Merchant not found");

    if (wallet.balance < amount) throw new Error("Insufficient balance");

    // Create payment
    const payment = await Payment.create({
      walletId: wallet.id,
      merchantId,
      amount,
    });

    // Create transaction record
    await Transaction.create({
      walletId: wallet.id,
      amount,
      type: TRANSACTION_TYPES.DEBIT,
      direction: merchant.name,
      description: `Payment to ${merchant.name}`,
    });

    // Update balance
    wallet.balance -= amount;
    await wallet.save();

    return payment;
  }

  static async getPaymentHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) throw new Error("Wallet not found");

    const { count, rows } = await Payment.findAndCountAll({
      where: { walletId: wallet.id },
      include: [{ association: "merchant" }],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      count,
      payments: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }
}

module.exports = PaymentService;
