const express = require("express");
const path = require("path");
const colors = require("colors");
const moragan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
var cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

// dotenv
dotenv.config();

//mongodb connection
connectDB();
// rest object
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(moragan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Static file for images
// PRODUCT IMAGES
app.use(
  "/propertyImages",
  express.static(path.join(__dirname, "propertyImages"))
);
app.use("/my-listings/", express.static("propertyImages"));
app.use("/my-listings/:id", express.static("propertyImages"));
app.use("/listing-info/:id", express.static("propertyImages"));
app.use("/edit-listing/:title", express.static("propertyImages"));
app.use("/listing", express.static("propertyImages"));
app.use("/listing/:area", express.static("propertyImages"));
app.use("/admin-view-product/:bbId", express.static("propertyImages"));
app.use("/my-wishlist", express.static("propertyImages"));
app.use("/seller-profile/:profileId", express.static("propertyImages"));
app.use("/admin-products/:type", express.static("propertyImages"));
app.use("/admin-deals/", express.static("propertyImages"));
// USER IMAGES
app.use("/userImages", express.static(path.join(__dirname, "userImages")));
app.use("/my-account", express.static("userImages"));
app.use("/listing-info/:bbId", express.static("userImages"));
app.use("/seller-profile/:profileId", express.static("userImages"));
app.use("/edit-listing/:title", express.static("userImages"));
// BLOG IMAGES
app.use("/blogImages", express.static(path.join(__dirname, "blogImages")));
app.use("/admin-blog", express.static("blogImages"));
// ANN IMAGES
app.use("/annImages", express.static(path.join(__dirname, "annImages")));
app.use("/admin-announcements", express.static("annImages"));
app.use("/announcement", express.static("annImages"));

//! routes
app.use("/api/user/", require("./routes/userRoutes"));
app.use("/api/contact/", require("./routes/contactRoutes"));
app.use("/api/admin/", require("./routes/adminRoutes"));
app.use("/api/property/", require("./routes/propertyRoutes"));
app.use("/api/deal/", require("./routes/dealRoutes"));
app.use("/api/blog/", require("./routes/blogRoutes"));
app.use("/api/ann/", require("./routes/annRoutes"));

// PORT
const port = process.env.PORT || 8080;

// STATIC FILES RUNNING ON BUILD FOLDER
if (process.env.NODE_MODE === "production") {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API running..");
  });
}

// Listen
app.listen(port, (req, res) => {
  console.log(
    `Server running in ${process.env.NODE_MODE} Mode on Port ${process.env.PORT}`
      .bgCyan
  );
});
