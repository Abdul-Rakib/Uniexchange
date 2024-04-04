const express = require("express");
const router = express.Router();
const annModel = require("../models/annModel");
const multer = require("multer");
const path = require("path");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

// add Ann
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "annImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});
const upload = multer({ storage: storage });

router.post("/add-ann", upload.single("image"), async (req, res) => {
  try {
    const { title, desc, contact, source, type } = req.body;
    let image = null;
    if (req.file) {
      image = req.file.filename;
    }
    let newAnn = new annModel({ title, desc, contact, source, type, image });
    newAnn.save();
    res.status(200).send({
      message: "Announcement added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// get all blog
router.get("/get-all-ann", async (req, res) => {
  try {
    const data = await annModel.find();
    res.status(200).send({
      data: data,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/get-blog-by-title", async (req, res) => {
  try {
    const data = await Blog.findOne({ title: req.body.name });
    if (!data) {
      return res.status(200).send({
        success: false,
        message: "No Blog Found",
      });
    }
    res.status(201).send({
      data: data,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// delete blog
router.post("/delete-ann", adminAuthMiddleware, async (req, res) => {
  try {
    const data = await annModel.findByIdAndDelete(req.body.id);
    res.status(200).send({
      message: "Announcement deleted",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
