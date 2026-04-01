"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // Many to One: Transaction -> Wallet
      Transaction.belongsTo(models.Wallet, {
        foreignKey: "walletId",
        as: "wallet",
      });
    }

    // Instance method to get transaction type label
    getTypeLabel() {
      return this.type === "debit" ? "Pengeluaran" : "Pemasukan";
    }

    // Static method to get transactions with sorting and filtering
    static async getFilteredTransactions(walletId, options = {}) {
      const {
        sort = "createdAt",
        order = "DESC",
        limit = 10,
        offset = 0,
      } = options;

      return this.findAll({
        where: { walletId },
        order: [[sort, order]],
        limit,
        offset,
        include: [
          {
            association: "wallet",
            include: [
              {
                association: "user",
                attributes: { exclude: ["password"] },
              },
            ],
          },
        ],
      });
    }
  }

  Transaction.init(
    {
      walletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Wallet ID is required",
          },
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Amount cannot be empty",
          },
          min: {
            args: [1],
            msg: "Amount must be greater than 0",
          },
          isInt: {
            msg: "Amount must be an integer",
          },
        },
      },
      type: {
        type: DataTypes.ENUM("debit", "credit"),
        allowNull: false,
        validate: {
          isIn: {
            args: [["debit", "credit"]],
            msg: "Type must be either debit or credit",
          },
        },
      },
      direction: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
      hooks: {
        afterCreate: async (transaction, options) => {
          // Update wallet balance after transaction creation
          const wallet = await sequelize.models.Wallet.findByPk(
            transaction.walletId,
            {
              transaction: options.transaction,
            },
          );
          if (wallet) {
            if (transaction.type === "debit") {
              wallet.balance -= transaction.amount;
            } else {
              wallet.balance += transaction.amount;
            }
            await wallet.save({ transaction: options.transaction });
          }
        },
      },
    },
  );

  return Transaction;
};
