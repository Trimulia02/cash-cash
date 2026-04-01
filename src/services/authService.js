const { User } = require("../../models");
const bcrypt = require("bcryptjs");

class AuthService {
  static async registerUser(userData) {
    const { name, email, password, phone } = userData;

    const exists = await User.findOne({ where: { email } });
    if (exists) throw new Error("Email already registered");

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: "user",
      isActive: true,
    });

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  static async loginUser(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("Invalid email or password");

    const isValid = await user.validatePassword(password);
    if (!isValid) throw new Error("Invalid email or password");

    if (!user.isActive) throw new Error("Account is inactive");

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  static async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password"] },
      include: [
        {
          association: "wallet",
          include: [
            {
              association: "transactions",
              attributes: [
                "id",
                "amount",
                "type",
                "description",
                "direction",
                "createdAt",
              ],
              order: [["createdAt", "DESC"]],
              limit: 5,
            },
          ],
        },
        {
          association: "sentTransfers",
          attributes: ["id", "amount", "createdAt"],
        },
        {
          association: "receivedTransfers",
          attributes: ["id", "amount", "createdAt"],
        },
      ],
    });

    if (!user) throw new Error("User not found");
    return user;
  }

  static async getWalletTransactions(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          association: "wallet",
          include: [
            {
              association: "transactions",
              attributes: [
                "id",
                "amount",
                "type",
                "description",
                "direction",
                "createdAt",
              ],
              order: [["createdAt", "DESC"]],
              limit: 5,
            },
          ],
        },
      ],
    });

    return user.wallet?.transactions || [];
  }

  static async getAllUsers() {
    return await User.findAll({
      where: { isActive: true },
      attributes: { exclude: ["password"] },
      include: [{ association: "wallet", attributes: ["balance"] }],
    });
  }
}

module.exports = AuthService;
