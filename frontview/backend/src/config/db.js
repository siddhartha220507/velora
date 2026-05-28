// config/db.js
const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        if (retries > 0) {
            console.log(`♻️ Retrying connection in 5s... (${retries} left)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            console.error("💀 MongoDB Connection Failed. Please check your MongoDB Atlas IP Whitelist.");
            // We don't exit here anymore to prevent constant crashing
        }
    }
};

module.exports = connectDB;