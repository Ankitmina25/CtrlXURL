const mongoose = require("mongoose");

const clickHistorySchema = new mongoose.Schema({
    url: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Url",
        required: true
    },

    ip: {
        type: String
    },

    browser: {
        type: String
    },

    device: {
        type: String
    },

    os: {
        type: String
    },

    clickedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("ClickHistory", clickHistorySchema);