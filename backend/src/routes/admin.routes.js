const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// GET /admin/logs/recent (admin only - últimos 10 logs)
router.get("/logs/recent", authMiddleware, adminController.getRecentLogs);

// GET /admin/logs (admin only - todos os logs com paginação)
router.get("/logs", authMiddleware, adminController.getLogs);

// POST /admin/logs (admin only - criar log)
router.post("/logs", authMiddleware, adminController.createLog);

module.exports = router;