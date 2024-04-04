const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  images: {
    type: Array,
    default: null,
  },
  bbId: {
    type: String,
    required: [true, "bbId is required"],
  },
  brand: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: null,
  },
  about: {
    type: String,
    default: null,
  },
  features: {
    type: Array,
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  subCategory: {
    type: String,
    default: null,
  },
  price: {
    type: String,
    default: null,
  },
  condition: {
    type: String,
    default: null,
  },
  area: {
    type: String,
    default: null,
  },
  address: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    default: null,
  },
  mobile: {
    type: String,
    default: null,
  },
  postedBy: {
    type: String,
    default: null,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  sold: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now(),
  },
  //extra fields
  //MOBILE
  mType: {
    type: String,
    default: null,
  },
  //BIKE
  bikeKm: {
    type: String,
    default: null,
  },
  bikeYear: {
    type: String,
    default: null,
  },
  //FASHION
  size: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: null,
    //BOOKS
  },
  sem: {
    type: String,
    default: null,
  },
  courseCode: {
    type: String,
    default: null,
  },
  author: {
    type: String,
    default: null,
  },
  edition: {
    type: String,
    default: null,
  },
  //SERVICES
  serviceTime: {
    type: String,
    default: null,
  },
  expiryDate: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
    },
  },
});

propertySchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const propertyModel = mongoose.model("property", propertySchema);
module.exports = propertyModel;
