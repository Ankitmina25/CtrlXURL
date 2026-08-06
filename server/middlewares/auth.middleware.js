const jwt = require('jsonwebtoken');
const userModel = require('../models/user.models');
const generateTokens = require('../utils/generateToken');
const setCookies = require('../utils/setCookies');
const authMiddleware = async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = req.cookies;
        if (!accessToken) {
            if (!refreshToken) {
                return res.status(401).json({
                    message: "Unauthorized"
                });
            }
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
            const user = await userModel.findById(decoded.id);
            if (!user) {
                return res.status(401).json({
                    message: "user not found"
                });
            }
            if (user.refreshToken !== refreshToken) {
                return res.status(401).json({
                    message: "Invalid refresh Token"
                });
            }
            const { accessToken: newAccessToken,
                refreshToken: newRefreshToken
            } = generateTokens(user);
            user.refreshToken = newRefreshToken;
            await user.save();
            setCookies(res, newAccessToken, newRefreshToken);
            req.user = user;
            return next();
        }
        const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }
        req.user = user;
        return next();
    } catch (err) {
        return res.status(401).json({
            message: err.message
        });
    }

}

module.exports={
    authMiddleware
}