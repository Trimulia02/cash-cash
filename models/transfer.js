"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transfer extends Model {
    static associate(models) {
      // Many to One: Transfer -> User (sender)
      Transfer.belongsTo(models.User, {
        foreignKey: "senderId",
        as: "sender",
      });

      // Many to One: Transfer -> User (receiver)
      Transfer.belongsTo(models.User, {
        foreignKey: "receiverId",
        as: "receiver",
      });
    }

    // Instance method to get status badge
    getStatusBadge() {
      const badges = {
        pending: "🔄 Pending",
        completed: "✅ Completed",
        failed: "❌ Failed",
      };
      return badges[this.status] || this.status;
    }

    // Static method to get transfer history with sorting
    static async getTransferHistory(userId, options = {}) {
      const { limit = 10, offset = 0, order = "DESC" } = options;
      const { Op } = require("sequelize");

      return this.findAll({
        where: {
          [Op.or]: [{ senderId: userId }, { receiverId: userId }],
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
        order: [["createdAt", order]],
        limit,
        offset,
      });
    }
  }

  Transfer.init(
    {
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Sender ID is required",
          },
        },
      },
      receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Receiver ID is required",
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
            args: [1000],
            msg: "Minimum transfer amount is Rp 1.000",
          },
          isInt: {
            msg: "Amount must be an integer",
          },
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed"),
        defaultValue: "pending",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Transfer",
    },
  );

  return Transfer;
};
