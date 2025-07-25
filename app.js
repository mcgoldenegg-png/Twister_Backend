require("dotenv").config();
const http = require('http');
const ngrok = require('@ngrok/ngrok');
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const activityRoutes = require("./routes/activityRoutes");
const continentRoutes = require("./routes/continentRoutes");
const countriesRoutes = require("./routes/countryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Database connection
require("./config/database");

// Routes
app.get("/", (req, res) => res.send("Server is running"));

// API Routes
app.use("/api/v1/continent", continentRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/countries", countriesRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// Start server and Ngrok
// app.listen(PORT, async () => {
//     console.log(`Server running on port ${PORT}`);

//     // Start ngrok tunnel
//     try {
//         const url = await ngrok.connect({
//             addr: PORT,
//             authtoken: process.env.NGROK_AUTH_TOKEN, // Set this in your .env file
//         });

//         console.log(`🔗 Public URL: ${url}`);
//     } catch (err) {
//         console.error("❌ Failed to start ngrok:", err);
//     }
// });
