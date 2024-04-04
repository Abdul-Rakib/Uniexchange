const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  subject: {
    type: String,
    required: [true, "mobile is required"],
  },
  msg: {
    type: String,
    required: [true, "message is required"],
  },
  status: {
    type: String,
    default: "pending",
  },
});

const contactModel = mongoose.model("contact", contactSchema);
module.exports = contactModel;
