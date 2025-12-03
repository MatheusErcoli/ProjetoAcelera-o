const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

// GET /reviews?providerId=123
router.get("/", reviewsController.getReviews);

// POST /reviews (authenticated)
router.post("/", authMiddleware, reviewsController.createReview);

module.exports = router;
