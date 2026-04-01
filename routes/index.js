const express = require("express");
const router = express.Router();

const publicRoutes = require("./publicRoutes");
const protectedRoutes = require("./protectedRoutes");
const apiRoutes = require("./apiRoutes");

router.use(publicRoutes);
router.use(protectedRoutes);
router.use("/api", apiRoutes);

module.exports = router;
