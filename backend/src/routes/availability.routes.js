const { Router } = require("express");
const {
  createAvailability,
  getAvailabilities,
  getAvailableSlots,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availability.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = Router();

// Rotas públicas
router.get("/:providerId", getAvailabilities);
router.get("/:providerId/available-slots", getAvailableSlots);

// Rotas protegidas (apenas prestadores)
router.post("/", authMiddleware, createAvailability);
router.put("/:id", authMiddleware, updateAvailability);
router.delete("/:id", authMiddleware, deleteAvailability);

module.exports = router;
