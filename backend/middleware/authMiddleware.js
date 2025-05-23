require("dotenv").config();
const jwt = require("jsonwebtoken");

// Middleware untuk memeriksa access token pada header Authorization
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];  // Format "Bearer <token>"
  if (!token) return res.status(401).json({ message: "Token format is invalid" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
