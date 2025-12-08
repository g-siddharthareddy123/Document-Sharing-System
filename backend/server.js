// server.js
const express = require("express");
const cors = require("cors");
const { Users } = require("./db"); // if you really need Users here later

const app = express();

// ----- MIDDLEWARE -----
const allowedOrigins = [
  "http://localhost:5173",         // local Vite frontend
  "https://document-shares.onrender.com",
  process.env.FRONTEND_URL         // production frontend (Render)
];

app.use(cors());

app.use(express.json());


// ----- ROUTES -----
app.use("/uploads", require("./routes/uploadRoutes"));
app.use("/docs", require("./routes/docRoutes"));

// pass Users via require OR ignore it if not needed here
app.use("/user", require("./Apis/userApi"));

// ----- TEST ROUTE -----
app.get("/mas", (req, res) => {
  res.json({ status: "Server Running", mongo: "Connected" });
});

// ----- START SERVER -----
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
