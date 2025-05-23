const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error(
    "JWT_SECRET atau JWT_REFRESH_SECRET belum di-set di environment variables"
  );
}

const COOKIE_OPTIONS = {
  httpOnly: true, // Cookie hanya bisa diakses server (tidak JS)
  secure: process.env.NODE_ENV === "production", // Hanya HTTPS di production
  sameSite: "strict", // Cegah CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie tahan 7 hari
};

// Registrasi user baru
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    // Cari user berdasar email
    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    // Validasi password dengan bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid email or password" });

    // Buat access token (expired 1 jam)
    const accessToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Buat refresh token (expired 7 hari)
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Simpan refresh token di HTTP-only cookie
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    // Kirim access token dan info user ke client
    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Endpoint untuk refresh access token menggunakan refresh token di cookie
exports.refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token missing" });

  // Verifikasi refresh token
  jwt.verify(token, JWT_REFRESH_SECRET, (err, payload) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    // Buat access token baru
    const newAccessToken = jwt.sign({ id: payload.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ accessToken: newAccessToken });
  });
};

// Logout: Hapus cookie refresh token
exports.logout = (req, res) => {
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  res.json({ message: "Logout successful" });
};

// Middleware untuk memeriksa access token di header Authorization
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer token"
  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user; // Simpan info user di request
    next();
  });
};
