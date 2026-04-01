const express = require("express");

const controller = require("../controllers/controller");
const { guestMiddleware } = require("../helpers/authMiddleware");

const router = express.Router();

// Public pages
router.get("/", controller.getHomepage);

// Auth pages for guests only
router.get("/register/add", guestMiddleware, controller.registerPage);
router.post("/register/add", guestMiddleware, controller.addRegister);
router.get("/login/add", guestMiddleware, controller.loginPage);
router.post("/login/add", guestMiddleware, controller.addLogin);

module.exports = router;
