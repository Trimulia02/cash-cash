"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // One to One: User -> Wallet
      User.hasOne(models.Wallet, {
        foreignKey: "userId",
        as: "wallet",
      });

      // One to Many: User -> Transfers (as sender)
      User.hasMany(models.Transfer, {
        foreignKey: "senderId",
        as: "sentTransfers",
      });

      // One to Many: User -> Transfers (as receiver)
      User.hasMany(models.Transfer, {
        foreignKey: "receiverId",
        as: "receivedTransfers",
      });
    }

    // Instance method to check password
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    // Getter for masked email
    get maskedEmail() {
      const [localPart, domain] = this.email.split("@");
      const maskedLocal =
        localPart.charAt(0) +
        "*".repeat(localPart.length - 2) +
        localPart.charAt(localPart.length - 1);
      return `${maskedLocal}@${domain}`;
    }

    // Static method to find user by email with wallet
    static async findByEmailWithWallet(email) {
      return this.findOne({
        where: { email },
        include: [{ association: "wallet" }],
      });
    }

    // Static method to get all active users
    static async getAllActiveUsers() {
      return this.findAll({
        where: { isActive: true },
        attributes: { exclude: ["password"] },
      });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Name cannot be empty",
          },
          len: {
            args: [3, 100],
            msg: "Name must be between 3 and 100 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already exists",
        },
        validate: {
          isEmail: {
            msg: "Must be a valid email address",
          },
          notEmpty: {
            msg: "Email cannot be empty",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Password cannot be empty",
          },
          len: {
            args: [6, 255],
            msg: "Password must be at least 6 characters",
          },
        },
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: {
            args: /^\+?[0-9\s\-()]+$/,
            msg: "Invalid phone number format",
          },
        },
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeCreate: async (user) => {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        },
        beforeUpdate: async (user) => {
          if (user.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    },
  );

  return User;
};
