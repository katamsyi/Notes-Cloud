const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Route untuk registrasi, login, refresh token dan logout
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

module.exports = router;
