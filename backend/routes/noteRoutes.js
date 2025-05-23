const express = require("express");
const router = express.Router();
const noteController = require("../controller/noteController");
const authenticateToken = require("../middleware/authMiddleware");

// Semua route note dilindungi dengan middleware autentikasi token
router.get("/", authenticateToken, noteController.getAllNotes);
router.get("/:id", authenticateToken, noteController.getNoteById);
router.post("/", authenticateToken, noteController.createNote);
router.put("/:id", authenticateToken, noteController.updateNote);
router.delete("/:id", authenticateToken, noteController.deleteNote);

module.exports = router;
