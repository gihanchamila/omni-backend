import mongoose from "mongoose";
import { connectionUrl } from "../config/kyes.js";

// connect mongodb
const connectMongodb = async () => {
    try {
        if (!connectionUrl) {
            throw new Error("❌ MongoDB connection URL is undefined! Check environment variables.");
        }

        await mongoose.connect(connectionUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        process.exit(1); // Stop the app if DB connection fails
    }
};

export default connectMongodb