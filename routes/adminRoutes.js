const multer = require("multer");
const express = require("express");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

const {
  getAllUserController,
  getUserController,
  editUserController,
  deleteUserController,
  addBrandController,
  getAllBrandContoller,
  addModelController,
  deleteModelController,
  adminGetAllOrdersController,
  adminUpdateOrderController,
  shippingChargeController,
  getShippingChargeController,
  addCouponController,
  deleteCouponController,
  getAllQueries,
  seenQueryController,
  sendMailToAllUsersController,
  homeLabelController,
  deleteBrandController,
  VerifyPropertyController,
  AdminGetAllPropertiesController,
  adminGetDealsController,
} = require("../controllers/AdminCtrl");

// router object
const router = express.Router();
// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "adsImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({ storage: storage });

//! ============== PROPERTY
router.post("/verify-property", adminAuthMiddleware, VerifyPropertyController);
router.get(
  "/admin-get-all-properties",
  adminAuthMiddleware,
  AdminGetAllPropertiesController
);
//! ============== PROPERTY

// ============== USERS
router.get("/get-all-users", adminAuthMiddleware, getAllUserController);
router.post("/get-user", adminAuthMiddleware, getUserController);
router.post("/delete-user", adminAuthMiddleware, deleteUserController);
router.post("/admin-edit-user", adminAuthMiddleware, editUserController);
// ============== ORDERS
router.get(
  "/admin-get-all-orders",
  adminAuthMiddleware,
  adminGetAllOrdersController
);
router.post("/update-order", adminAuthMiddleware, adminUpdateOrderController);
// ============== BRANDS
router.post("/add-brand", adminAuthMiddleware, addBrandController);
router.post("/delete-brand", adminAuthMiddleware, deleteBrandController);
router.get("/get-all-brands", getAllBrandContoller);
router.post("/add-model", adminAuthMiddleware, addModelController);
router.post("/delete-model", adminAuthMiddleware, deleteModelController);
// ============== SHIPPING CHARGE & COUPON
router.get("/get-shipping-charge", getShippingChargeController);
router.post(
  "/update-shipping-charge",
  adminAuthMiddleware,
  shippingChargeController
);
router.post("/update-home-label", adminAuthMiddleware, homeLabelController);
router.post("/add-coupon", adminAuthMiddleware, addCouponController);
router.post("/delete-coupon", adminAuthMiddleware, deleteCouponController);
// ============== QUERIES
router.get("/get-all-queries", adminAuthMiddleware, getAllQueries);
router.post("/query-seen", adminAuthMiddleware, seenQueryController);
// ============== DEALS
router.get(
  "/admin-get-all-deals",
  adminAuthMiddleware,
  adminGetDealsController
);

// ============== BULK EMAIL
router.post(
  "/send-mail-to-all-users",
  adminAuthMiddleware,
  sendMailToAllUsersController
);

module.exports = router;
