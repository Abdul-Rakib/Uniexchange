const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    author: {
      type: String,
    },
    image: {
      type: String,
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    description: {
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
const blogModel = mongoose.model("blog", blogSchema);

module.exports = blogModel;
