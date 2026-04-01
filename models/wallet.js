"use strict";
const { Model } = require("sequelize");
const { rupiahFormat } = require("../helpers/currencyFormat");

module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    static associate(models) {
      // One to One: Wallet -> User
      Wallet.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // One to Many: Wallet -> Transactions
      Wallet.hasMany(models.Transaction, {
        foreignKey: "walletId",
        as: "transactions",
      });

      // Many to Many: Wallet -> Merchants (through Payments)
      Wallet.belongsToMany(models.Merchant, {
        through: models.Payment,
        foreignKey: "walletId",
        otherKey: "merchantId",
        as: "merchants",
      });
    }

    // Getter for formatted balance
    get rupiahFormat() {
      return rupiahFormat(this.balance);
    }

    // Instance method to check if sufficient balance
    hasSufficientBalance(amount) {
      return this.balance >= amount;
    }

    // Static method to get wallet with all transactions
    static async getWalletWithTransactions(walletId) {
      return this.findByPk(walletId, {
        include: [
          { association: "transactions" },
          { association: "user", attributes: { exclude: ["password"] } },
        ],
      });
    }

    // Static method to search wallets by balance range
    static async searchByBalanceRange(minBalance, maxBalance) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          balance: {
            [Op.gte]: minBalance,
            [Op.lte]: maxBalance,
          },
        },
        include: [
          {
            association: "user",
            attributes: { exclude: ["password"] },
          },
        ],
      });
    }
  }

  Wallet.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: "User ID is required",
          },
        },
      },
      balance: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
        validate: {
          min: {
            args: [0],
            msg: "Balance cannot be negative",
          },
          isInt: {
            msg: "Balance must be an integer",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Wallet",
    },
  );

  return Wallet;
};
