const express = require("express");
const router = express.Router();
const { userRegister, otpVerify, userLogin, userLogout } = require("../controllers/auth.controllers");
const {getProfile}= require('../controllers/auth.controllers');
const {authMiddleware}=require('../middlewares/auth.middleware');

router.post("/register", userRegister);
router.post("/verify-otp", otpVerify);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;