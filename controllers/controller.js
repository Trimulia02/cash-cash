const AuthService = require("../src/services/authService");
const WalletService = require("../src/services/walletService");
const TransferService = require("../src/services/transferService");
const PaymentService = require("../src/services/paymentService");
const MerchantService = require("../src/services/merchantService");
const {
  validateRegistration,
  validateLogin,
  validateTransfer,
  validatePayment,
} = require("../src/validators/inputValidator");
const { User, Wallet, Merchant, sequelize } = require("../models");

class Controller {
  // ===== HOME & AUTH PAGES =====

  static async getHomepage(req, res) {
    try {
      if (req.session?.userId) {
        return res.redirect("/dashboard");
      }
      res.render("home");
    } catch (error) {
      console.error("Error in getHomepage:", error);
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

      // Validate input
      const validation = validateRegistration({
        name,
        email,
        password,
        passwordConfirm,
        phone,
      });

      if (!validation.isValid) {
        return res.redirect(
          "/register/add?error=" + encodeURIComponent(validation.errors[0]),
        );
      }

      // Register user using service
      const user = await AuthService.registerUser({
        name,
        email,
        password,
        phone,
      });

      // Create wallet for user
      await Wallet.create({
        userId: user.userId,
        balance: 100000, // Initial balance
      });

      res.redirect("/login/add?success=Registration successful");
    } catch (error) {
      console.error("Error in addRegister:", error);
      const errorMsg = error.message || "Registration failed";
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

      // Validate input
      const validation = validateLogin({ email, password });

      if (!validation.isValid) {
        return res.redirect(
          "/login/add?error=" + encodeURIComponent(validation.errors[0]),
        );
      }

      // Login user using service
      const user = await AuthService.loginUser(email, password);

      // Set session
      req.session.userId = user.userId;
      req.session.email = user.email;
      req.session.name = user.name;
      req.session.role = user.role;

      res.redirect("/");
    } catch (error) {
      console.error("Error in addLogin:", error);
      res.redirect(
        "/login/add?error=" +
          encodeURIComponent(error.message || "Login failed"),
      );
    }
  }

  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.send("Error logging out");
        }
        res.redirect("/");
      });
    } catch (error) {
      console.error("Error in logout:", error);
      res.send(error.message);
    }
  }

  // ===== DASHBOARD & WALLET =====

  static async getDashboard(req, res) {
    try {
      const user = await AuthService.getUserProfile(req.session.userId);

      res.render("dashboard", { user });
    } catch (error) {
      console.error("Error in getDashboard:", error);
      res.render("dashboard", { error: error.message });
    }
  }

  // ===== TRANSACTIONS =====

  static async getTransactions(req, res) {
    try {
      const sort = req.query.sort || "createdAt";
      const order = req.query.order || "DESC";
      const page = req.query.page || 1;
      const limit = 10;

      const result = await WalletService.getTransactions(
        req.session.userId,
        page,
        limit,
        sort,
        order,
      );

      res.render("transactions", {
        user: { id: req.session.userId, name: req.session.name },
        transactions: result.transactions,
        pagination: {
          total: result.count,
          page: result.page,
          limit: result.limit,
          pages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        sort,
        order,
        error: null,
      });
    } catch (error) {
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
        return res.status(400).json({
          success: false,
          message: "Min and max balance required",
        });
      }

      const wallets = await WalletService.searchByBalanceRange(
        parseInt(minBalance, 10),
        parseInt(maxBalance, 10),
      );

      res.json({
        success: true,
        data: wallets,
      });
    } catch (error) {
      console.error("Error in searchWallets:", error);
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

      const merchants = await MerchantService.searchByCategory(category);

      res.json({
        success: true,
        data: merchants,
      });
    } catch (error) {
      console.error("Error in searchMerchants:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ===== TRANSFERS =====

  static async getTransfers(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const result = await TransferService.getTransferHistory(
        req.session.userId,
        page,
        limit,
      );

      res.render("transfers", {
        user: { id: req.session.userId, name: req.session.name },
        transfers: result.transfers,
        pagination: {
          total: result.count,
          page: result.page,
          limit: result.limit,
          pages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        error: null,
      });
    } catch (error) {
      console.error("Error in getTransfers:", error);
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
    try {
      const { receiverId, amount } = req.body;

      // Validate input
      const validation = validateTransfer({ receiverId, amount });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors[0],
        });
      }

      // Create transfer using service
      const result = await TransferService.createTransfer(
        req.session.userId,
        parseInt(receiverId, 10),
        parseInt(amount, 10),
      );

      res.json({
        success: true,
        message: "Transfer successful",
        data: result,
      });
    } catch (error) {
      console.error("Error in createTransfer:", error);
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

      const result = await MerchantService.getAllMerchants({
        page,
        limit,
        category,
      });

      res.render("merchants", {
        user: { id: req.session.userId, name: req.session.name },
        merchants: result.merchants,
        pagination: {
          total: result.count,
          page: result.page,
          limit: result.limit,
          pages: result.totalPages,
          hasNextPage: result.page < result.totalPages,
          hasPrevPage: result.page > 1,
        },
        category,
        error: null,
      });
    } catch (error) {
      console.error("Error in getMerchants:", error);
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
    try {
      const { merchantId, amount } = req.body;

      // Validate input
      const validation = validatePayment({ merchantId, amount });

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.errors[0],
        });
      }

      // Create payment using service
      const result = await PaymentService.createPayment(
        req.session.userId,
        parseInt(merchantId, 10),
        parseInt(amount, 10),
      );

      res.json({
        success: true,
        message: "Payment successful",
        data: result,
      });
    } catch (error) {
      console.error("Error in createPayment:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Payment failed",
      });
    }
  }
}

module.exports = Controller;
