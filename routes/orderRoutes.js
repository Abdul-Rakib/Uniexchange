const express = require("express");
const {
  placeOrderController,
  trackOrderController,
  getAllOrdersController,
  getOrderByIdController,
} = require("../controllers/orderCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

// router object
const router = express.Router();

// routes
router.post("/place-order", placeOrderController);
router.post("/track-order", trackOrderController);
router.post("/get-user-orders", authMiddleware, getAllOrdersController);
router.post("/get-order-by-id", authMiddleware, getOrderByIdController);

module.exports = router;
