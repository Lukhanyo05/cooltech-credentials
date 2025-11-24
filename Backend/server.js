// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// =============================================================================
// MAIN APPLICATION ROUTES
// =============================================================================

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/userManagement"));
app.use("/api/credentials", require("./routes/credentials"));
app.use("/api/divisions", require("./routes/divisions"));

// =============================================================================
// DATABASE CONNECTION & SERVER STARTUP
// =============================================================================

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/cooltech-credentials",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Main application endpoints:`);
  console.log(`   - Auth:        http://localhost:${PORT}/api/auth`);
  console.log(`   - Admin:       http://localhost:${PORT}/api/admin`);
  console.log(`   - Credentials: http://localhost:${PORT}/api/credentials`);
  console.log(`   - Divisions:   http://localhost:${PORT}/api/divisions`);
});
