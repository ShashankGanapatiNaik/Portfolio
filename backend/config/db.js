const mongoose = require("mongoose");
const dns = require("dns");

// Set custom DNS servers to bypass Windows/ISP DNS SRV query issues
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (err) {
  console.warn("⚠️ Failed to set custom DNS servers for SRV resolution:", err.message);
}

let isDbConnected = false;

// Convert mongodb+srv:// to standard URI to bypass SRV DNS lookup issues on Windows
const buildDirectUri = (srvUri) => {
  try {
    // Extract credentials and cluster from SRV URI
    // mongodb+srv://user:pass@cluster0.qidyrye.mongodb.net/dbname
    const match = srvUri.match(
      /mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/?(.*)/
    );
    if (!match) return null;
    const [, user, pass, host, rest] = match;
    // Atlas clusters use the format: cluster0.qidyrye.mongodb.net
    // Direct nodes are: cluster0-shard-00-00.qidyrye.mongodb.net:27017 etc.
    const clusterBase = host.split(".").slice(1).join("."); // qidyrye.mongodb.net
    const clusterName = host.split(".")[0]; // cluster0
    const nodes = [0, 1, 2]
      .map(
        (i) =>
          `${clusterName}-shard-00-0${i}.${clusterBase}:27017`
      )
      .join(",");
    const dbAndParams = rest
      ? `${rest}?ssl=true&authSource=admin&replicaSet=atlas-${clusterBase.split(".")[0]}-shard-0`
      : `portfolio?ssl=true&authSource=admin`;
    return `mongodb://${user}:${pass}@${nodes}/${dbAndParams}`;
  } catch {
    return null;
  }
};

const tryConnect = async (uri, label) => {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  isDbConnected = true;
  console.log(`✅ MongoDB Connected (${label}): ${conn.connection.host}`);
  return true;
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in .env");
    return false;
  }

  // Attempt 1: Standard SRV connection
  try {
    return await tryConnect(uri, "SRV");
  } catch (error) {
    console.error(`❌ MongoDB SRV connection error: ${error.message}`);
  }

  // Attempt 2: Retry SRV once more (transient DNS blip)
  try {
    console.log("🔁 Retrying SRV connection...");
    await new Promise((r) => setTimeout(r, 2000));
    return await tryConnect(uri, "SRV retry");
  } catch (error) {
    console.error(`❌ SRV retry failed: ${error.message}`);
  }

  // Attempt 3: Direct connection (bypasses SRV DNS lookup)
  if (uri.startsWith("mongodb+srv://")) {
    console.log("🔁 Trying direct node connection (bypassing SRV DNS)...");
    const directUri = buildDirectUri(uri);
    if (directUri) {
      try {
        return await tryConnect(directUri, "direct");
      } catch (error) {
        console.error(`❌ Direct connection failed: ${error.message}`);
      }
    }
  }

  isDbConnected = false;
  console.warn("⚠️  All connection attempts failed.");
  console.warn(
    "   Check: 1) Atlas Network Access has 0.0.0.0/0  2) Cluster is not paused  3) Credentials in .env are correct"
  );
  console.warn(
    "⚠️  Server will start but all /api/* routes will return 503 until MongoDB is reachable."
  );
  return false;
};

const getDbStatus = () => isDbConnected;

module.exports = { connectDB, getDbStatus };
