"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Many to One: Payment -> Wallet
      Payment.belongsTo(models.Wallet, {
        foreignKey: "walletId",
        as: "wallet",
      });

      // Many to One: Payment -> Merchant
      Payment.belongsTo(models.Merchant, {
        foreignKey: "merchantId",
        as: "merchant",
      });
    }
  }

  Payment.init(
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
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Merchant ID is required",
          },
        },
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: {
            args: [1],
            msg: "Amount must be greater than 0",
          },
          isInt: {
            msg: "Amount must be an integer",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Payment",
    },
  );

  return Payment;
};
