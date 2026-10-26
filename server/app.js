const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require("./routes/auth.routes");
const cookieParser = require('cookie-parser');
const urlRoutes = require("./routes/url.routes");
const contactRoutes = require("./routes/contact.routes");
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		return callback(new Error('Not allowed by CORS'));
	},
	credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);
app.use("/api/contact", contactRoutes);

module.exports = app;