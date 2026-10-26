const userModel = require('../models/user.models');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');
const setCookies = require('../utils/setCookies');
const generateTokens = require('../utils/generateToken');

const userRegister = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        if (existingUser.isVerified) {
            return res.status(400).json({
                message: "User is already exists"
            });
        }
        await userModel.findByIdAndDelete(existingUser._id);
    }
    const hashPass = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000);
    let user;
    try {
        user = await userModel.create({
            username,
            email,
            password: hashPass,
            otp,
            otpExpiry: Date.now() + 3 * 60 * 1000
        });

        try {
            await sendEmail(email, otp);
        } catch (emailErr) {
            console.error("\n❌ Email delivery failed via SMTP:", emailErr.message);
            console.log(`======================================================`);
            console.log(`🔑 [DEV OTP CODE] For ${email}: ${otp}`);
            console.log(`👉 Enter this code on the OTP page to verify your account!`);
            console.log(`======================================================\n`);
        }

        return res.status(201).json({
            message: "OTP sent successfully"
        });
    } catch (err) {
        if (user && user._id) {
            await userModel.findByIdAndDelete(user._id);
        }
        return res.status(500).json({
            message: err.message
        });
    }
};

const otpVerify = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (String(user.otp) !== String(otp)) {
            return res.status(400).json({
                message: "OTP is invalid"
            });
        }
        if (Date.now() > user.otpExpiry) {
            return res.status(400).json({ message: "OTP is Expired" });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();


        const { accessToken, refreshToken } = generateTokens(user);
        setCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            message: "OTP verified successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password is required"
            });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User is not found"
            });
        }
        if (!user.isVerified) {
            return res.status(400).json({
                message: "Verify your email first"
            });
        }
        const isPass = await bcrypt.compare(
            password,
            user.password
        );
        if (!isPass) {
            return res.status(400).json({
                message: "Password is incorrect"
            });
        }
        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();
        setCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            message: "Login successful"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const userLogout = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        user.refreshToken = null;
        await user.save();
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        return res.status(200).json({
            message: "User Logout successfully"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

const getProfile = async (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};

module.exports = {
    userRegister,
    otpVerify,
    userLogin,
    userLogout,
    getProfile
}
