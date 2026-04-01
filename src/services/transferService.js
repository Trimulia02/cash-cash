const {
  sequelize,
  User,
  Wallet,
  Transfer,
  Transaction,
} = require("../../models");
const {
  TRANSACTION_TYPES,
  TRANSFER_STATUS,
} = require("../constants/transactionTypes");

class TransferService {
  static async createTransfer(senderId, receiverId, amount) {
    if (amount < 1000) throw new Error("Minimum transfer is Rp 1.000");
    if (senderId === receiverId) throw new Error("Cannot transfer to yourself");

    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) throw new Error("User not found");

    const senderWallet = await Wallet.findOne({ where: { userId: senderId } });
    const receiverWallet = await Wallet.findOne({
      where: { userId: receiverId },
    });

    if (!senderWallet || !receiverWallet) throw new Error("Wallet not found");
    if (senderWallet.balance < amount) throw new Error("Insufficient balance");

    // Create transfer
    const transfer = await Transfer.create({
      senderId,
      receiverId,
      amount,
      status: TRANSFER_STATUS.COMPLETED,
    });

    // Create transactions
    await Transaction.create({
      walletId: senderWallet.id,
      amount,
      type: TRANSACTION_TYPES.DEBIT,
      direction: `Transfer to ${receiver.name}`,
      description: `Transfer to ${receiver.name}`,
    });

    await Transaction.create({
      walletId: receiverWallet.id,
      amount,
      type: TRANSACTION_TYPES.CREDIT,
      direction: `Transfer from ${sender.name}`,
      description: `Transfer from ${sender.name}`,
    });

    // Update balances
    senderWallet.balance -= amount;
    receiverWallet.balance += amount;

    await senderWallet.save();
    await receiverWallet.save();

    return transfer;
  }

  static async getTransferHistory(userId, page = 1, limit = 10) {
    const { Op } = require("sequelize");
    const offset = (page - 1) * limit;

    const { count, rows } = await Transfer.findAndCountAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        { association: "sender", attributes: ["id", "name"] },
        { association: "receiver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      count,
      transfers: rows,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  static async getTransferById(transferId) {
    const transfer = await Transfer.findByPk(transferId, {
      include: [
        { association: "sender", attributes: ["id", "name"] },
        { association: "receiver", attributes: ["id", "name"] },
      ],
    });

    if (!transfer) throw new Error("Transfer not found");
    return transfer;
  }
}

module.exports = TransferService;
