const mongoose = require("mongoose");

let isDbConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const fallbackUri =
    process.env.LOCAL_MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio";

  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in .env");
    return false;
  }

  const tryConnect = async (connectionString) => {
    const conn = await mongoose.connect(connectionString);
    isDbConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  };

  try {
    return await tryConnect(uri);
  } catch (error) {
    isDbConnected = false;
    console.error(`❌ MongoDB connection error: ${error.message}`);

    if (uri.startsWith("mongodb+srv://")) {
      console.warn(
        "MongoDB Atlas SRV lookup failed. Make sure Atlas allows your IP.",
      );
      console.warn(
        "Go to: https://cloud.mongodb.com → Network Access → Add IP Address → Allow from Anywhere",
      );
    }

    if (fallbackUri && fallbackUri !== uri) {
      console.log(`🔁 Attempting fallback: ${fallbackUri}`);
      try {
        return await tryConnect(fallbackUri);
      } catch (fallbackError) {
        console.error(`❌ Fallback connection error: ${fallbackError.message}`);
      }
    }

    return false;
  }
};

const getDbStatus = () => isDbConnected;

module.exports = { connectDB, getDbStatus };
