require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const app = express();

// Gunakan PORT dari environment variable, default ke 8080 yang umum di Cloud Run
const PORT = process.env.PORT || 5000;

// Daftar origin yang diizinkan mengakses backend (sesuaikan frontend port dan domain)
const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://notes-be006-371739253078.us-central1.run.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Mengizinkan tools seperti Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Mengizinkan cookie (refresh token) dikirim ke frontend
  })
);

app.use(express.json()); // Middleware untuk parsing JSON request body
app.use(cookieParser()); // Middleware untuk parsing cookie

// Daftarkan routing
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

// Tes koneksi database
sequelize
  .authenticate()
  .then(() => console.log("Database connection established"))
  .catch((err) => console.error("Unable to connect to database:", err));

// Sinkronisasi model ke database tanpa menghapus data lama
sequelize
  .sync()
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Error syncing database:", err));

// Middleware untuk menangani error secara global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// Jalankan server, dengarkan pada port yang sudah ditentukan
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server berjalan di port: ${PORT}`);
});
