const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orders.controller");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/", orderController.createOrder);

router.get("/", orderController.getOrders);

router.get("/:id", orderController.getOrderById);

router.put("/:id/status", orderController.updateOrderStatus);

router.delete("/:id", orderController.deleteOrder);

module.exports = router;
