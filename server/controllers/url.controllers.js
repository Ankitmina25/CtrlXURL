const urlModel = require('../models/url.models');
const crypto = require('crypto');
const QRCode = require("qrcode");
const clickHistoryModel = require("../models/clickHistory.models");
const UAParser = require("ua-parser-js");
const { redisClient } = require("../config/Redis");
const regex = /^[a-z0-9-]{3,10}$/;

const createShortCode = async (req, res) => {

    try {
        let { originalUrl, customCode, expiryDate } = req.body;
        let shortCode;
        if (!originalUrl) {
            return res.status(400).json({
                message: "Original URL is required"
            });
        }
        if (expiryDate) {
            if (new Date(expiryDate) <= new Date()) {
                return res.status(400).json({
                    message: "Expiry date must be in the future"
                });
            }
        }
        if (customCode) {
            customCode = customCode.trim().toLowerCase();
            if (!customCode) {
                return res.status(400).json({
                    message: "Custom code cannot be empty"
                });
            }
            if (customCode.length < 3 || customCode.length > 10) {
                return res.status(400).json({
                    message: "Custom code must be between 3 and 10 Characters"
                })
            }

            if (!regex.test(customCode)) {
                return res.status(400).json({
                    message: "Custom code can only contain lowercase letters, numbers and hyphens"
                });
            }
            const existingCode = await urlModel.findOne({
                shortCode: customCode
            })
            if (existingCode) {
                return res.status(400).json({
                    message: "Custom code already exists"
                });
            }
            shortCode = customCode;
        } else {
            shortCode = crypto.randomBytes(3).toString("hex");
        }
        const url = await urlModel.create({
        originalUrl,
        shortCode,
        user: req.user._id,
        expiryDate
});

await redisClient.set(
    `url:${shortCode}`,
    JSON.stringify({
        id: url._id.toString(),
        originalUrl: url.originalUrl,
        expiryDate: url.expiryDate
    })
);

const shortUrl = `${process.env.BASE_URL}/api/url/${shortCode}`;
        const qrCode = await QRCode.toDataURL(shortUrl);
        return res.status(201).json({
            message: "Short URL created successfully",
            shortUrl,
            qrCode,
            data: {
                id: url._id,
                originalUrl: url.originalUrl,
                shortCode: url.shortCode,
                clicks: url.clicks
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const redirectUrl = async (req, res) => {
    try {
        const { shortCode } = req.params;

        let cachedUrl = await redisClient.get(`url:${shortCode}`);
        let url;

        if (cachedUrl) {
            console.log("Redis Cache HIT");

            const parsedUrl = JSON.parse(cachedUrl);

            url = {
                _id: parsedUrl.id,
                originalUrl: parsedUrl.originalUrl,
                expiryDate: parsedUrl.expiryDate,
                clicks: parsedUrl.clicks
            };

            if (url.expiryDate && new Date(url.expiryDate) < new Date()) {
                return res.status(410).json({
                    message: "This URL has expired"
                });
            }

        } else {
            console.log("Redis Cache MISS");

            url = await urlModel.findOne({
                shortCode
            });

            if (!url) {
                return res.status(404).json({
                    message: "URL not found"
                });
            }

            if (url.expiryDate && url.expiryDate < new Date()) {
                return res.status(410).json({
                    message: "This URL has expired"
                });
            }

            await redisClient.set(
                `url:${shortCode}`,
                JSON.stringify({
                    id: url._id.toString(),
                    originalUrl: url.originalUrl,
                    expiryDate: url.expiryDate
                })
            );
        }

        const parser = new UAParser(
            req.headers["user-agent"] || ""
        );

        const result = parser.getResult();

        await clickHistoryModel.create({
            url: url._id,
            ip: req.ip,
            browser: result.browser.name || "Unknown",
            device: result.device.type || "Desktop",
            os: result.os.name || "Unknown"
        });

        await urlModel.findByIdAndUpdate(
            url._id,
            {
                $inc: {
                    clicks: 1
                }
            }
        );

        return res.redirect(url.originalUrl);

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const getUrls = async (req, res) => {
    try {
        const { page = 1, search = "" } = req.query;
        const limit = 10;
        const currentPage = Number(page);
        const searchText = search.trim();
        if (isNaN(currentPage) || currentPage < 1) {
            return res.status(400).json({
                message: "Invalid page number"
            });
        }
        const skip = (currentPage - 1) * limit;
        const query = {
            user: req.user._id
        };

        if (searchText) {
            query.$or = [
                {
                    shortCode: {
                        $regex: searchText,
                        $options: "i"
                    }
                },
                {
                    originalUrl: {
                        $regex: searchText,
                        $options: "i"
                    }
                }
            ]
        }
        const totalUrls = await urlModel.countDocuments(query);
        const urls = await urlModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
        return res.status(200).json({
            currentPage,
            totalPages: Math.ceil(totalUrls / limit),
            totalUrls,
            urls
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

const deleteUrl = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await urlModel.findById(id);
        if (!url) {
            return res.status(404).json({
                message: "URL not found"
            })
        }
        if (url.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized user to delete this URL"
            });
        }
        await url.deleteOne();
        return res.status(200).json({
            message: "URL delete successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

const getAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const url = await urlModel.findById(id);
        if (!url) {
            return res.status(404).json({
                message: "URL not found"
            });
        }
        if (url.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "You are not authorized user"
            });
        }
        const clickHistory = await clickHistoryModel.find({ url: id })
            .sort({ clickedAt: -1 })
            .select("ip browser device os clickedAt");
        return res.status(200).json({
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            clicks: url.clicks,
            createdAt: url.createdAt,
            updatedAt: url.updatedAt,
            clickHistory
        });
    } catch (err) {
        message: err.message;
    }
}

const getDashboardStats = async (req, res) => {
    try {
        const totalUrls = await urlModel.countDocuments({
            user: req.user._id
        });
        const activeUrls = await urlModel.countDocuments({
            user: req.user._id,
            expiryDate: {
                $gt: new Date()
            }
        });
        const expiredUrls = await urlModel.countDocuments({
            user: req.user._id,
            expiryDate: {
                $lte: new Date()
            }
        });
        const clickResult = await urlModel.aggregate([
            {
                $match: {
                    user: req.user._id
                }
            },
            {
                $group: {
                    _id: null,
                    totalClicks: {
                        $sum: "$clicks"
                    }
                }
            }
        ]);
        const totalClicks = clickResult.length > 0 ? clickResult[0].totalClicks : 0;
        return res.status(200).json({
            totalUrls,
            activeUrls,
            expiredUrls,
            totalClicks
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

module.exports =
{
    createShortCode,
    redirectUrl,
    getUrls,
    deleteUrl,
    getAnalytics,
    getDashboardStats
};