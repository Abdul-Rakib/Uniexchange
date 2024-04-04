const express = require("express");
const router = express.Router();
const Blog = require("../models/blogModel");
const multer = require("multer");
const path = require("path");

// add blog
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "blogImages");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname.replace(/\s+/g, "-"));
  },
});
const upload = multer({ storage: storage });

router.post("/add-blog", upload.single("image"), async (req, res) => {
  try {
    req.body.image = req.file.filename;
    let newBlog = new Blog(req.body);
    newBlog.save();
    res.status(200).send({
      message: "blog add successfully",
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
router.get("/get-all-blog", async (req, res) => {
  try {
    const data = await Blog.find();
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
router.post("/delete-blog", async (req, res) => {
  try {
    const data = await Blog.findByIdAndDelete(req.body.id);
    res.status(200).send({
      message: "blog deleted",
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
