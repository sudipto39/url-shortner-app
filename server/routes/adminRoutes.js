const express = require("express");
const adminController = require("../controllers/adminController")
const { protect, restrictTo } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/login", adminController.adminLogin);
router.get("/urls", protect, restrictTo("admin"), adminController.listUrls);

module.exports = router;
