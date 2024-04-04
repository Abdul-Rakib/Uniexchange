const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

const {
  addDealController,
  getUserDealsController,
  giveAccessController,
  getDealerListController,
  markAsSoldController,
  getDealForReviewsController,
  getAllDealsByIdController,
  getOrderHistoryController,
} = require("../controllers/dealCtrl");

// router object
const router = express.Router();

// routes
router.post("/add-deal", authMiddleware, addDealController);
router.post("/get-user-deals", authMiddleware, getUserDealsController);
router.post("/get-order-history", authMiddleware, getOrderHistoryController);
router.post("/give-access", authMiddleware, giveAccessController);
router.post("/get-dealers-list", authMiddleware, getDealerListController);
router.post("/mark-as-sold", authMiddleware, markAsSoldController);
router.post("/deal-for-reviews", authMiddleware, getDealForReviewsController);
router.post(
  "/get-all-deals-by-id",
  adminAuthMiddleware,
  getAllDealsByIdController
);

module.exports = router;
