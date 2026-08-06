const express = require("express");
const router = express.Router();
const { createShortCode, redirectUrl, getUrls, deleteUrl, getAnalytics,getDashboardStats } = require("../controllers/url.controllers");
const { authMiddleware } = require("../middlewares/auth.middleware");

router.post("/create", authMiddleware, createShortCode);
router.get("/my-urls", authMiddleware, getUrls);
router.get("/dashboard", authMiddleware, getDashboardStats);
router.delete("/:id", authMiddleware, deleteUrl);
router.get('/:id/analytics', authMiddleware, getAnalytics);
router.get("/:shortCode", redirectUrl);


module.exports = router;