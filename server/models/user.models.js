const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    otp: {
        type: Number
    },
    otpExpiry: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
}, {
    timestamps: true
})
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;