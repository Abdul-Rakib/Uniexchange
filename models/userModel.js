const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  isAdmin: {
    type: Boolean,
    default: false,
  },
  profileId: {
    type: String,
    default: null,
  },
  uniID: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  username: {
    type: String,
    required: [true, "email is required"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  mobile: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  wishlist: {
    type: Array,
  },
  reviews: {
    type: Array,
  },
  emailOtp: {
    type: String,
  },
  mobileOtp: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;
