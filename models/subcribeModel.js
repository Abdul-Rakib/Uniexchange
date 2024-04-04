const mongoose = require("mongoose");

const subscribeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "email is required"],
  },
  allowed: {
    type: Boolean,
    default: true,
  },
});

const subscribeModel = mongoose.model("subscribe", subscribeSchema);
module.exports = subscribeModel;
