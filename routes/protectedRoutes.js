const express = require("express");

const controller = require("../controllers/controller");
const { authMiddleware } = require("../helpers/authMiddleware");

const router = express.Router();

router.get("/logout", authMiddleware, controller.logout);
router.get("/dashboard", authMiddleware, controller.getDashboard);
router.get("/transactions", authMiddleware, controller.getTransactions);
router.get("/transfers", authMiddleware, controller.getTransfers);
router.post("/transfers/create", authMiddleware, controller.createTransfer);
router.get("/merchants", authMiddleware, controller.getMerchants);
router.post("/payments/create", authMiddleware, controller.createPayment);

module.exports = router;
