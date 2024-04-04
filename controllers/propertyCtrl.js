const property = require("../models/propertyModel");
const userModel = require("../models/userModel");
const sendMail = require("./sendMail");
const fs = require("fs").promises;
const path = require("path");

const addPropertyController = async (req, res) => {
  try {
    const newPropertyData = req.body;
    newPropertyData.features = JSON.parse(newPropertyData.features);
    const newProperty = new property(newPropertyData);

    const uploadedImages = req.files.map((file) => file.path);
    const totalImages = newProperty.images.length + uploadedImages.length;
    if (totalImages > 8) {
      const excessImages = totalImages - 8;
      newProperty.images.splice(0, excessImages);
    }
    newProperty.images = newProperty.images.concat(uploadedImages);
    await newProperty.save();

    await sendMail(
      "uniexchange.in@gmail.com",
      "New Product Added",
      "",
      "Please Login and check the new Product"
    );

    res.status(200).send({
      message: "Product added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add Product Ctrl ${error.message}`,
    });
  }
};

const updatePropertyController = async (req, res) => {
  try {
    const propertyExist = await property.findOne({ bbId: req.body.bbId });
    if (!propertyExist) {
      return res
        .status(200)
        .send({ success: false, message: "No product found" });
    }
    const { images, ...otherProperties } = req.body;
    otherProperties.features = JSON.parse(otherProperties.features);
    const updateProperty = await property.findOneAndUpdate(
      { _id: propertyExist._id },
      { $set: { ...otherProperties, verified: false } },
      { new: true }
    );
    if (!updateProperty) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to update" });
    }
    const uploadedImages = req.files.map((file) => file.path);
    const totalImages = updateProperty.images.length + uploadedImages.length;
    if (totalImages > 8) {
      const excessImages = totalImages - 8;
      updateProperty.images.splice(0, excessImages);
    }
    updateProperty.images = updateProperty.images.concat(uploadedImages);
    await updateProperty.save();
    return res
      .status(202)
      .send({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Update Product Ctrl ${error.message}`,
    });
  }
};

const deletePropertyImagesController = async (req, res) => {
  try {
    const findProperty = await property.findOne({ _id: req.body.id });
    if (!findProperty) {
      return res
        .status(200)
        .send({ success: false, message: "No product found" });
    }

    await Promise.all(
      findProperty.images.map(async (imagePath) => {
        try {
          await fs.unlink(imagePath);
        } catch (error) {
          console.error(`Error deleting image: ${error.message}`);
        }
      })
    );

    findProperty.images = [];
    await findProperty.save();
    return res
      .status(201)
      .send({ success: true, message: "All Images Deleted Successfully" });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Delete Img Ctrl ${error.message}` });
  }
};

const getAllUserPropertiesController = async (req, res) => {
  try {
    const properties = await property.find({ email: req.body.email });
    if (properties.length === 0) {
      return res.status(200).send({ success: false, message: "Nothing Found" });
    }
    return res
      .status(201)
      .send({ success: true, message: "Fetched Success", data: properties });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get All User Product Ctrl ${error.message}`,
    });
  }
};

const deletePropertyController = async (req, res) => {
  try {
    const existingProperty = await property.findById({ _id: req.body.id });
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    await Promise.all(
      existingProperty.images.map(async (imagePath) => {
        try {
          await fs.unlink(imagePath);
        } catch (error) {
          console.error(`Error deleting image: ${error.message}`);
        }
      })
    );
    await property.findByIdAndDelete({ _id: req.body.id });
    // delete from wishlist
    await userModel.updateMany(
      { "wishlist.bbId": req.body.bbId },
      { $pull: { wishlist: { bbId: req.body.bbId } } }
    );

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(`Delete Product Ctrl ${error.message}`);
    res.status(500).json({
      success: false,
      message: `Delete Product Ctrl ${error.message}`,
    });
  }
};

const getPropertyController = async (req, res) => {
  try {
    const findProperty = await property.findOne({ bbId: req.body.bbId });
    if (!findProperty) {
      return res
        .status(200)
        .send({ success: false, message: "No Product found" });
    }
    if (!req.body.address) {
      findProperty.address = undefined;
    }
    return res
      .status(201)
      .send({ success: true, message: "Product Fetched", data: findProperty });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `get Product Ctrl ${error.message}`,
    });
  }
};

const getPropertyControllerForEdit = async (req, res) => {
  try {
    const findProperty = await property.findOne({ bbId: req.body.bbId });
    if (!findProperty) {
      return res
        .status(200)
        .send({ success: false, message: "No Product found" });
    }
    return res
      .status(201)
      .send({ success: true, message: "Product Fetched", data: findProperty });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `get Product Ctrl ${error.message}`,
    });
  }
};

const getAllPropertiesController = async (req, res) => {
  try {
    const allProperty = await property.find({ verified: true, sold: false });
    if (allProperty.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Product found" });
    }
    const sanitizedProperties = allProperty.map((property) => {
      const { mobile, address, ...sanitizedProperty } = property.toObject();
      return sanitizedProperty;
    });
    return res.status(201).send({
      success: true,
      message: "Product Fetched",
      data: sanitizedProperties,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `get Product Ctrl ${error.message}`,
    });
  }
};

module.exports = {
  addPropertyController,
  getAllUserPropertiesController,
  deletePropertyController,
  getAllPropertiesController,
  updatePropertyController,
  deletePropertyImagesController,
  getPropertyController,
  getPropertyControllerForEdit,
};
