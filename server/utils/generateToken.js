const jwt = require('jsonwebtoken');
const generateTokens = (user) => {
    const accessToken = jwt.sign({
        id: user._id,
        email: user.email
    }, process.env.JWT_TOKEN, {
        expiresIn: "15m"
    });
    const refreshToken = jwt.sign({
        id: user._id,
    }, process.env.REFRESH_TOKEN, {
        expiresIn: "7d"
    })
    return {
        accessToken,
        refreshToken
    }
}
module.exports = generateTokens
