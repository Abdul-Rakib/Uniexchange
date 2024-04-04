const express = require("express");
const contactModel = require("../models/contactModel");

// router object
const router = express.Router();

// routes
// Get Contact Form || get
router.get("/get-contact-form");
// Add Contact Form || post
router.post("/add-contact-form", async (req, res) => {
  try {
    const newContact = new contactModel(req.body);
    await newContact.save();
    res
      .status(201)
      .send({ success: true, message: "Form Submitted Successful" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Contact ${error}`,
    });
  }
});

module.exports = router;
