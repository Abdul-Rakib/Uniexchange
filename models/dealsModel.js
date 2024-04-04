const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema({
  bbId: {
    type: String,
    required: [true, "bbId is required"],
  },
  user: {
    type: String,
    required: [true, "user name is required"],
  },
  userEmail: {
    type: String,
    required: [true, "user email is required"],
  },
  userMobile: {
    type: String,
    required: [true, "user mobile is required"],
  },
  seller: {
    type: String,
    required: [true, "seller name is required"],
  },
  sellerEmail: {
    type: String,
    required: [true, "seller email is required"],
  },
  sellerMobile: {
    type: String,
    required: [true, "seller mobile is required"],
  },
  sellerProfileId: {
    type: String,
  },
  access: {
    type: Boolean,
    default: false,
  },
  product: {
    type: String,
    default: null,
  },
  productImg: {
    type: String,
    default: null,
  },
  dealDone: {
    type: Boolean,
    default: false,
  },
  soldTo: {
    type: String,
    default: null,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
});

const dealModel = mongoose.model("deal", dealSchema);
module.exports = dealModel;
