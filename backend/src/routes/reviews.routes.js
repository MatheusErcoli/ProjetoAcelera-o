const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// GET /reviews?providerId=123
router.get("/", reviewsController.getReviews);

// GET /reviews/all (admin only - todas as avaliações)
router.get("/all", authMiddleware, reviewsController.getAllReviewsAdmin);

// GET /reviews/pending (admin only - avaliações pendentes)
router.get("/pending", authMiddleware, reviewsController.getPendingReviews);

// POST /reviews (authenticated)
router.post("/", authMiddleware, reviewsController.createReview);

// PUT /reviews/:id/toggle (admin only - ativar/desativar)
router.put("/:id/toggle", authMiddleware, reviewsController.toggleReviewStatus);

module.exports = router;
