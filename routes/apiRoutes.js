const express = require("express");

const controller = require("../controllers/controller");
const { authMiddleware } = require("../helpers/authMiddleware");

const router = express.Router();

// Protected API routes
router.use(authMiddleware);
router.get("/wallets/search", controller.searchWallets);
router.get("/merchants/search", controller.searchMerchants);

module.exports = router;
