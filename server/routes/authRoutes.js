const express = require("express");
const { signUp, login } = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register", signUp);
router.post("/login", login);

module.exports = router;
