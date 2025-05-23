require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Daftar origin yang diizinkan mengakses backend (frontend biasanya di port 5500)
const allowedOrigins = ["http://localhost:5500", "http://127.0.0.1:5500","https://notes-be006-371739253078.us-central1.run.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Mengizinkan request tanpa origin (Postman, curl)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Mengizinkan pengiriman cookie (refresh token)
  })
);

app.use(express.json()); // Middleware untuk parsing JSON body
app.use(cookieParser()); // Middleware untuk parsing cookie

// Routes
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

// Test koneksi database dan sinkronisasi model
sequelize
  .authenticate()
  .then(() => console.log("Database connection established"))
  .catch((err) => console.error("Unable to connect to database:", err));

sequelize
  .sync() // Sinkronisasi model tanpa hapus data
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
