const {
  User,
  Wallet,
  Transaction,
  Transfer,
  Merchant,
  Payment,
  sequelize,
} = require("../models/index");
const {
  getPaginationInfo,
  buildPaginationResponse,
} = require("../helpers/paginationHelper");
const { Op } = require("sequelize");

class Controller {
  // ===== HOME & AUTH PAGES =====

  static async getHomepage(req, res) {
    try {
      // Keep dashboard data flow in one place
      if (req.session?.userId) {
        return res.redirect("/dashboard");
      }

      // Otherwise show landing page
      res.render("home");
    } catch (error) {
      console.log(error);
      res.render("home", { error: error.message });
    }
  }

  static async registerPage(req, res) {
    try {
      const { error = null } = req.query;
      res.render("register", { error });
    } catch (error) {
      res.render("register", { error: error.message });
    }
  }

  static async addRegister(req, res) {
    try {
      const { name, email, password, passwordConfirm, phone } = req.body;

      // Validation
      if (!name || !email || !password || !passwordConfirm) {
        return res.redirect(
          "/register/add?error=" +
            encodeURIComponent("All fields are required"),
        );
      }

      if (password !== passwordConfirm) {
        return res.redirect(
          "/register/add?error=" + encodeURIComponent("Passwords do not match"),
        );
      }

      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.redirect(
          "/register/add?error=" +
            encodeURIComponent("Email already registered"),
        );
      }

      // Create user with wallet
      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: "user",
      });

      // Create wallet for user
      await Wallet.create({
        userId: user.id,
        balance: 100000, // Initial balance
      });

      // Redirect to login with success message
      res.redirect("/login/add?success=Registration successful");
    } catch (error) {
      console.log(error);
      const errorMsg = error.errors
        ? error.errors.map((e) => e.message).join(", ")
        : error.message;
      res.redirect("/register/add?error=" + encodeURIComponent(errorMsg));
    }
  }

  static async loginPage(req, res) {
    try {
      const { error = null, success = null } = req.query;
      res.render("login", { error, success });
    } catch (error) {
      res.render("login", { error: error.message });
    }
  }

  static async addLogin(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.redirect(
          "/login/add?error=" +
            encodeURIComponent("Email and password required"),
        );
      }

      // Find user
      const user = await User.findOne({
        where: { email },
        include: [{ association: "wallet" }],
      });

      if (!user) {
        return res.redirect(
          "/login/add?error=" + encodeURIComponent("Invalid email or password"),
        );
      }

      // Validate password
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return res.redirect(
          "/login/add?error=" + encodeURIComponent("Invalid email or password"),
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return res.redirect(
          "/login/add?error=" + encodeURIComponent("Account is deactivated"),
        );
      }

      // Set session
      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.name = user.name;
      req.session.role = user.role;

      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.redirect("/login/add?error=" + encodeURIComponent("Login failed"));
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.send("Error logging out");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.log(error);
      res.send(error.message);
    }
  }

  // ===== DASHBOARD & WALLET =====

  static async getDashboard(req, res) {
    try {
      const user = await User.findByPk(req.session.userId, {
        include: [
          {
            association: "wallet",
            include: [{ association: "transactions" }],
          },
        ],
      });

      if (!user) {
        return res.redirect("/login/add");
      }

      res.render("dashboard", { user });
    } catch (error) {
      console.log(error);
      res.render("dashboard", { error: error.message });
    }
  }

  // ===== TRANSACTIONS =====

  static async getTransactions(req, res) {
    try {
      const {
        sort = "createdAt",
        order = "DESC",
        page = 1,
        limit = 10,
      } = req.query;
      const {
        offset,
        page: pageNumber,
        limit: limitNumber,
      } = getPaginationInfo(page, limit);

      const wallet = await Wallet.findOne({
        where: { userId: req.session.userId },
      });

      if (!wallet) {
        return res.status(404).send("Wallet not found");
      }

      // Use static method for filtered transactions with sorting
      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: { walletId: wallet.id },
        order: [[sort, order]],
        limit: limitNumber,
        offset,
        include: [{ association: "wallet" }],
      });

      const pagination = buildPaginationResponse(
        transactions,
        count,
        pageNumber,
        limitNumber,
      );

      res.render("transactions", {
        user: { id: req.session.userId, name: req.session.name },
        transactions: pagination.data,
        pagination: pagination.pagination,
        sort,
        order,
        error: null,
      });
    } catch (error) {
      console.log(error);
      res.render("transactions", {
        user: {
          id: req.session?.userId || null,
          name: req.session?.name || "",
        },
        transactions: [],
        pagination: null,
        sort: req.query?.sort || "createdAt",
        order: req.query?.order || "DESC",
        error: error.message,
      });
    }
  }

  // ===== SEARCHES & FILTERS =====

  static async searchWallets(req, res) {
    try {
      const { minBalance, maxBalance } = req.query;

      if (!minBalance || !maxBalance) {
        return res.status(400).send("Min and max balance required");
      }

      // Use static method for balance range search
      const wallets = await Wallet.searchByBalanceRange(
        parseInt(minBalance, 10),
        parseInt(maxBalance, 10),
      );

      res.json({
        success: true,
        data: wallets,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async searchMerchants(req, res) {
    try {
      const { category } = req.query;

      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Category required",
        });
      }

      // Use static method for merchant search
      const merchants = await Merchant.searchByCategory(category);

      res.json({
        success: true,
        data: merchants,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===== TRANSFERS =====

  static async getTransfers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const {
        offset,
        page: pageNumber,
        limit: limitNumber,
      } = getPaginationInfo(page, limit);

      // Use static method for transfer history
      const { count, rows: transfers } = await Transfer.findAndCountAll({
        where: {
          [Op.or]: [
            { senderId: req.session.userId },
            { receiverId: req.session.userId },
          ],
        },
        include: [
          { association: "sender", attributes: { exclude: ["password"] } },
          { association: "receiver", attributes: { exclude: ["password"] } },
        ],
        order: [["createdAt", "DESC"]],
        limit: limitNumber,
        offset,
      });

      const pagination = buildPaginationResponse(
        transfers,
        count,
        pageNumber,
        limitNumber,
      );

      res.render("transfers", {
        user: { id: req.session.userId, name: req.session.name },
        transfers: pagination.data,
        pagination: pagination.pagination,
        error: null,
      });
    } catch (error) {
      console.log(error);
      res.render("transfers", {
        user: {
          id: req.session?.userId || null,
          name: req.session?.name || "",
        },
        transfers: [],
        pagination: null,
        error: error.message,
      });
    }
  }

  static async createTransfer(req, res) {
    // Use database transaction to prevent race conditions
    const transaction = await sequelize.transaction();

    try {
      const { receiverId, amount } = req.body;
      const parsedReceiverId = parseInt(receiverId, 10);
      const parsedAmount = parseInt(amount, 10);

      // Validation
      if (!parsedReceiverId || !parsedAmount) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Receiver ID and amount (in Rupiah) required",
        });
      }

      if (parsedAmount < 1000) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Minimum transfer amount is Rp 1.000",
        });
      }

      // Validate sender and receiver
      const sender = await User.findByPk(req.session.userId, {
        transaction,
      });
      const receiver = await User.findByPk(parsedReceiverId, {
        transaction,
      });

      if (!sender || !receiver) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Sender or receiver not found",
        });
      }

      if (sender.id === receiver.id) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Cannot transfer to yourself",
        });
      }

      // Get wallets with lock
      const senderWallet = await Wallet.findOne({
        where: { userId: sender.id },
        lock: true,
        transaction,
      });

      const receiverWallet = await Wallet.findOne({
        where: { userId: receiver.id },
        lock: true,
        transaction,
      });

      // Validate wallets exist
      if (!senderWallet) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Sender wallet not found",
        });
      }

      if (!receiverWallet) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Receiver wallet not found",
        });
      }

      // Check balance
      if (!senderWallet.hasSufficientBalance(parsedAmount)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Available: Rp ${senderWallet.balance}`,
        });
      }

      // Create transfer record
      const transfer = await Transfer.create(
        {
          senderId: sender.id,
          receiverId: receiver.id,
          amount: parsedAmount,
          status: "completed",
        },
        { transaction },
      );

      // Create transaction records
      await Transaction.create(
        {
          walletId: senderWallet.id,
          amount: parsedAmount,
          type: "debit",
          direction: `Transfer to ${receiver.name}`,
          description: `Transfer to ${receiver.name} (ID: ${receiver.id})`,
        },
        { transaction },
      );

      await Transaction.create(
        {
          walletId: receiverWallet.id,
          amount: parsedAmount,
          type: "credit",
          direction: `Transfer from ${sender.name}`,
          description: `Transfer from ${sender.name} (ID: ${sender.id})`,
        },
        { transaction },
      );

      // Commit transaction
      await transaction.commit();

      res.json({
        success: true,
        message: "Transfer successful",
        data: {
          transferId: transfer.id,
          from: sender.name,
          to: receiver.name,
          amount: parsedAmount,
          status: transfer.status,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Transfer error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Transfer failed",
      });
    }
  }

  // ===== MERCHANTS & PAYMENTS =====

  static async getMerchants(req, res) {
    try {
      const { page = 1, limit = 10, category = "" } = req.query;
      const {
        offset,
        page: pageNumber,
        limit: limitNumber,
      } = getPaginationInfo(page, limit);

      const whereClause = {};
      if (category) {
        whereClause.category = {
          [Op.like]: `%${category}%`,
        };
      }

      const { count, rows: merchants } = await Merchant.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: "wallets",
            through: { attributes: ["amount"] },
          },
        ],
        order: [["name", "ASC"]],
        limit: limitNumber,
        offset,
      });

      const pagination = buildPaginationResponse(
        merchants,
        count,
        pageNumber,
        limitNumber,
      );

      res.render("merchants", {
        user: { id: req.session.userId, name: req.session.name },
        merchants: pagination.data,
        pagination: pagination.pagination,
        category,
        error: null,
      });
    } catch (error) {
      console.log(error);
      res.render("merchants", {
        user: {
          id: req.session?.userId || null,
          name: req.session?.name || "",
        },
        merchants: [],
        pagination: null,
        category: req.query?.category || "",
        error: error.message,
      });
    }
  }

  static async createPayment(req, res) {
    // Use database transaction to prevent race conditions
    const transaction = await sequelize.transaction();

    try {
      const { merchantId, amount } = req.body;
      const parsedAmount = parseInt(amount, 10);

      // Validation
      if (!merchantId || !parsedAmount) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Merchant and amount (in Rupiah) required",
        });
      }

      if (parsedAmount < 10000) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Minimum payment amount is Rp 10.000",
        });
      }

      // Get wallet with lock
      const wallet = await Wallet.findOne({
        where: { userId: req.session.userId },
        lock: true,
        transaction,
      });

      if (!wallet) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Your wallet not found",
        });
      }

      // Check merchant exists
      const merchant = await Merchant.findByPk(merchantId, { transaction });
      if (!merchant) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Merchant not found",
        });
      }

      // Check balance
      if (!wallet.hasSufficientBalance(parsedAmount)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Available: Rp ${wallet.balance}`,
        });
      }

      // Create payment record
      const payment = await Payment.create(
        {
          walletId: wallet.id,
          merchantId,
          amount: parsedAmount,
        },
        { transaction },
      );

      // Create transaction record
      await Transaction.create(
        {
          walletId: wallet.id,
          amount: parsedAmount,
          type: "debit",
          direction: merchant.name,
          description: `Payment to ${merchant.name}`,
        },
        { transaction },
      );

      // Commit transaction
      await transaction.commit();

      res.json({
        success: true,
        message: "Payment successful",
        data: {
          paymentId: payment.id,
          merchant: merchant.name,
          amount: parsedAmount,
          timestamp: payment.createdAt,
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Payment error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Payment failed",
      });
    }
  }
}

module.exports = Controller;
