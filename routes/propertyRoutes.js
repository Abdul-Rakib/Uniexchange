const express = require("express");
const multer = require("multer");
const fs = require("fs");

const {
  addPropertyController,
  getAllUserPropertiesController,
  deletePropertyController,
  getPropertyController,
  getAllPropertiesController,
  updatePropertyController,
  deletePropertyImagesController,
  getPropertyControllerForEdit,
} = require("../controllers/propertyCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

// router object
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "propertyImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({ storage: storage });

//! routes
router.post(
  "/add-property",
  authMiddleware,
  upload.array("images", 8),
  addPropertyController
);
router.post(
  "/update-property",
  authMiddleware,
  upload.array("images", 8),
  updatePropertyController
);
router.post(
  "/get-all-user-property",
  authMiddleware,
  getAllUserPropertiesController
);
router.post(
  "/delete-property-images",
  authMiddleware,
  deletePropertyImagesController
);
router.post("/delete-property", authMiddleware, deletePropertyController);
router.post("/get-property", getPropertyController);
router.post("/get-property-edit", getPropertyControllerForEdit);
router.get("/get-all-property", getAllPropertiesController);

module.exports = router;
