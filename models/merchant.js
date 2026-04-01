"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Merchant extends Model {
    static associate(models) {
      // Many to Many: Merchant -> Wallets (through Payments)
      Merchant.belongsToMany(models.Wallet, {
        through: models.Payment,
        foreignKey: "merchantId",
        otherKey: "walletId",
        as: "wallets",
      });
    }

    // Static method to get merchants with their payments
    static async getMerchantsWithPayments(options = {}) {
      const { sort = "createdAt", order = "DESC" } = options;

      return this.findAll({
        include: [
          {
            association: "wallets",
            through: { attributes: ["amount", "createdAt"] },
          },
        ],
        order: [[sort, order]],
      });
    }

    // Static method to search merchants by category
    static async searchByCategory(category) {
      const { Op } = require("sequelize");
      return this.findAll({
        where: {
          category: {
            [Op.iLike]: `%${category}%`,
          },
        },
      });
    }
  }

  Merchant.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Merchant name is required",
          },
          len: {
            args: [2, 100],
            msg: "Merchant name must be between 2 and 100 characters",
          },
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Category is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Merchant",
    },
  );

  return Merchant;
};
