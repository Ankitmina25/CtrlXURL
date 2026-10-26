const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./db/connectDB");
const { connectRedis } = require("./config/Redis.js");

const port = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        await connectRedis();

        app.listen(port, () => {
            console.log(`Server is running on ${port}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
};

startServer();