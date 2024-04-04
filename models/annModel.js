const mongoose = require("mongoose");

const annSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
    contact: {
      type: String,
    },
    source: {
      type: String,
    },
    type: {
      type: String,
    },
    image: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
const annModel = mongoose.model("announcement", annSchema);
module.exports = annModel;
