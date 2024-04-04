const express = require("express");
const multer = require("multer");
const fs = require("fs");
const {
  loginController,
  registerController,
  authController,
  getAllUserController,
  DeleteUserController,
  getUserController,
  sendMailController,
  verifyOtpController,
  updatePassController,
  updateUserController,
  adminController,
  subscribeController,
  userProfileUpdateController,
  getAllSubscribersController,
  unsubscribeController,
  dashboardCountController,
  addToWishlistController,
  removeFromWishlistController,
  getSellerController,
  addReviewController,
  registerEmailOtpController,
  getSellerProfileController,
  checkMobileNumberController,
  otpLoginController,
  getHomeCountController,
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

// router object
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "userImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({ storage: storage });

// routes
router.post("/admin", adminController);
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/send-email-otp", registerEmailOtpController);
router.post("/update-user", updateUserController);
router.post(
  "/user-profile-update",
  upload.single("image"),
  userProfileUpdateController
);
router.post("/user", getUserController);
router.post("/get-seller", getSellerController);
router.post("/get-seller-profile", getSellerProfileController);
router.post("/getUserData", authMiddleware, authController);
router.post("/get-all-users", getAllUserController);
router.post("/delete-user", DeleteUserController);
router.post("/send-otp", sendMailController);
router.post("/verify-otp", verifyOtpController);
router.post("/update-pass", updatePassController);
router.post("/get-dashboard-count", authMiddleware, dashboardCountController);
router.post("/add-to-wishlist", addToWishlistController);
router.post("/remove-from-wishlist", removeFromWishlistController);
router.post("/check-mobile-number", checkMobileNumberController);
router.post("/otp-login", otpLoginController);
// SUBSCRIBERS
router.post("/subscribe", subscribeController);
router.post("/unsubscribe", unsubscribeController);
router.get("/get-all-subscribers", getAllSubscribersController);
// REVIEWS
router.post("/add-review", authMiddleware, addReviewController);
router.get("/get-count", getHomeCountController);

// router.post("/get-payment-method", getUserPaymentDetailsController);

module.exports = router;
