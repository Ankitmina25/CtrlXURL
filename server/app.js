const express = require('express');
const app = express();
const cors = require('cors');
const authRoutes = require("./routes/auth.routes");
const cookieParser = require('cookie-parser');
const urlRoutes = require("./routes/url.routes");
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/url", urlRoutes);

module.exports = app;