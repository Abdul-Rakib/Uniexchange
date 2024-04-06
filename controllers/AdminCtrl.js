const userModel = require("../models/userModel");
const contactModel = require("../models/contactModel");
const subcribeModel = require("../models/subcribeModel");
const propertyModel = require("../models/propertyModel");
const dealModel = require("../models/dealsModel");

const fs = require("fs");
const nodemailer = require("nodemailer");

const getAllUserController = async (req, res) => {
  try {
    const allUser = await userModel.find({
      email: { $ne: "firefalls2004@gmail.com" },
    });
    if (!allUser) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "All Users Fetched Sucesss",
      data: allUser,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get All User Ctrl ${error.message}` });
  }
};

const getUserController = async (req, res) => {
  try {
    const user = await userModel.find({ _id: req.body.id });
    if (!user) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "All Users Fetched Sucesss",
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get User Ctrl ${error.message}` });
  }
};

const deleteUserController = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete({ _id: req.body.id });
    if (!user) {
      return res.status(200).send({ success: false, message: "No User Found" });
    }
    return res.status(200).send({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Delete User Ctrl ${error.message}` });
  }
};

const editUserController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(201).send({
        success: false,
        message: "User Not Found",
      });
    }
    const updateUser = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: req.body },
      { new: true }
    );
    if (!updateUser) {
      return res.status(200).send({
        success: false,
        message: "Failed to Update User",
      });
    }
    return res
      .status(201)
      .send({ success: true, message: "User Updated Successfully" });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Admin Edit User Ctrl ${error.message}`,
    });
  }
};

// ================= BULK EMAIL
const sendMailToAllUsersController = async (req, res) => {
  try {
    const { subject, msg } = req.body;
    const users = await subcribeModel.find({ allowed: true });

    if (users.length === 0) {
      return res.status(200).send({ success: false, message: "No user found" });
    }

    // Loop through users and send email to each user
    for (const user of users) {
      const { email } = user;
      try {
        const dynamicData = {
          subject: `${subject}`,
          msg: `${msg}`,
          user_email: email,
        };

        let htmlContent = fs.readFileSync("bulkMail.html", "utf8");
        Object.keys(dynamicData).forEach((key) => {
          const placeholder = new RegExp(`{${key}}`, "g");
          htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
        });

        // Send mail
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "mobihaven.skinz@gmail.com",
            pass: "ezkhbefirpnajwqd",
          },
        });

        let mailDetails = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: subject,
          html: htmlContent,
        };

        await mailTransporter.sendMail(mailDetails);
      } catch (error) {
        console.error(`Error sending email to ${user.email}:`, error);
      }
    }

    res
      .status(200)
      .send({ success: true, message: "Emails sent to all users" });
  } catch (error) {
    console.error(`Send Mail to Users Ctrl: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const addBrandController = async (req, res) => {
  try {
    const brand = await brandModel.findOne({ name: req.body.name });
    if (brand) {
      return res
        .status(200)
        .send({ success: false, message: "Brand name already exists" });
    }
    const newBrand = new brandModel(req.body);
    await newBrand.save();
    return res
      .status(200)
      .send({ success: true, message: "Brand Successfully Added" });
  } catch (error) {
    console.error(`Add Brand Ctrl: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const getAllBrandContoller = async (req, res) => {
  try {
    const brands = await brandModel.find({});
    if (brands.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No brands found" });
    }
    return res
      .status(200)
      .send({ success: true, message: "Brand Fetched Success", data: brands });
  } catch (error) {
    console.error(`Get All Brands Ctrl: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const addModelController = async (req, res) => {
  try {
    const { name, model } = req.body;
    const brand = await brandModel.findOne({ name: name });
    if (!brand) {
      return res
        .status(200)
        .send({ success: false, message: "Brand not found" });
    }
    // brand.models = brand.models || [];
    // const isDuplicate = brand.models.some(
    //   (existingModel) => existingModel.modelName === model.modelName
    // );
    // if (isDuplicate) {
    //   return res
    //     .status(201)
    //     .send({ success: false, message: "Model already exists" });
    // }
    brand.models.push(model);
    const updatedBrand = await brand.save();
    return res.status(202).send({
      success: true,
      message: "Model added successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error(`Add Model Controller Error: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const deleteModelController = async (req, res) => {
  try {
    const { name, modelName } = req.body;
    const brand = await brandModel.findOne({ name: name });
    if (!brand) {
      return res
        .status(200)
        .send({ success: false, message: "Brand not found" });
    }
    const modelIndex = brand.models.findIndex(
      (existingModel) => existingModel === modelName
    );
    if (modelIndex === -1) {
      return res
        .status(201)
        .send({ success: false, message: "Model not found" });
    }
    brand.models.splice(modelIndex, 1);
    const updatedBrand = await brand.save();
    return res.status(202).send({
      success: true,
      message: "Model deleted successfully",
      data: updatedBrand,
    });
  } catch (error) {
    console.error(`Delete Model Controller Error: ${error.message}`);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
};

const deleteBrandController = async (req, res) => {
  try {
    const { name } = req.body;
    const brand = await brandModel.findOne({ name: name });
    if (!brand) {
      return res
        .status(200)
        .send({ success: false, message: "Brand not found" });
    }
    const deleteBrand = await brandModel.findOneAndDelete({ name: name });
    return res.status(202).send({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Delete Brand Controller Error: ${error.message}`,
    });
  }
};

//! ================= ORDERS

const adminGetAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    if (!orders) {
      return res
        .status(200)
        .send({ success: false, message: "No Orders Found" });
    }
    return res.status(201).send({
      success: true,
      message: "All Orders Fetched Success",
      data: orders,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Admin Get All Order Ctrl ${error.message}`,
    });
  }
};

const adminUpdateOrderController = async (req, res) => {
  try {
    const order = await orderModel.findOne({ orderId: req.body.orderId });
    if (!order) {
      return res
        .status(200)
        .send({ success: false, message: "No Order Found" });
    }
    const updateOrder = await orderModel.findOneAndUpdate(
      {
        orderId: req.body.orderId,
      },
      { $set: { address: req.body.location, status: req.body.status } },
      { new: true }
    );
    if (!updateOrder) {
      return res.status(201).send({
        success: false,
        message: "Failed to update the order",
      });
    }

    const msg = {
      shipped: "Hurray! Your order has been shipped successfully.",
      "on hold": "Your order has been put on hold.",
      completed: "Your order has been delivered successfully. Happy Shopping!",
      cancelled: "Your order has been cancelled :(",
      refunded: "Your refund has been initiated.",
      failed: "Your order is failed.",
    };

    //! SENDING EMAIL
    try {
      const dynamicData = {
        subject: `${req.body.status}`,
        msg: `${msg[req.body.status]}`,
      };
      let htmlContent = fs.readFileSync("statusMail.html", "utf8");
      Object.keys(dynamicData).forEach((key) => {
        const placeholder = new RegExp(`{${key}}`, "g");
        htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
      });
      // Send mail
      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "mobihaven.skinz@gmail.com",
          pass: "ezkhbefirpnajwqd",
        },
      });
      let mailDetails = {
        from: "mobihaven.skinz@gmail.com",
        to: `${req.body.location.email}`,
        subject: `Order ${req.body.status}`,
        html: htmlContent,
      };
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log(err);
        }
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }
    //! SENDING EMAIL

    return res.status(202).send({
      success: true,
      message: "Order updated successfullt",
      data: updateOrder,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Admin Get All Order Ctrl ${error.message}`,
    });
  }
};

const getShippingChargeController = async (req, res) => {
  try {
    const shipping = await offerModel.find({});
    if (!shipping) {
      return res.status(200).send({
        success: false,
        message: "No Shipping Found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Shipping Fetched Succss",
      data: shipping,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Shipping Charge Ctrl ${error.message}`,
    });
  }
};

const shippingChargeController = async (req, res) => {
  try {
    const newShippingCharge = req.body.shipping; // Adjust this based on your actual data structure
    const existingShipping = await offerModel.findOne();
    if (existingShipping) {
      await offerModel.updateOne({}, { shippingCharge: newShippingCharge });
    } else {
      await offerModel.create({ shippingCharge: newShippingCharge });
    }
    res.status(200).send({
      success: true,
      message: "Shipping charge updated successfully",
      data: existingShipping,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Shipping Charge Ctrl ${error.message}`,
    });
  }
};

const homeLabelController = async (req, res) => {
  try {
    const newHomeLabel = req.body.label;
    const existingLabel = await offerModel.findOne();
    if (existingLabel) {
      await offerModel.updateOne({}, { homeLabel: newHomeLabel });
    } else {
      await offerModel.create({ homeLabel: newHomeLabel });
    }
    res.status(200).send({
      success: true,
      message: "Home Label updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Home Label Ctrl ${error.message}`,
    });
  }
};

const addCouponController = async (req, res) => {
  try {
    const { name, discount } = req.body;

    // Check if the coupon with the same name already exists
    const existingCoupon = await offerModel.findOne({
      "coupons.name": name,
    });

    if (existingCoupon) {
      return res.status(200).send({
        success: false,
        message: "Coupon with the same name already exists",
      });
    }

    // If the coupon doesn't exist, add it to the coupons array
    const result = await offerModel.updateOne(
      {},
      {
        $push: {
          coupons: {
            name: name,
            discount: discount,
          },
        },
      }
    );
    if (result.modifiedCount > 0) {
      res.status(201).send({
        success: true,
        message: "Coupon added successfully",
      });
    } else {
      res.status(202).send({
        success: false,
        message: "Failed to add the coupon",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Coupon Ctrl ${error.message}`,
    });
  }
};

const deleteCouponController = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the coupon with the specified name exists
    const existingCoupon = await offerModel.findOne({
      "coupons.name": name,
    });

    if (!existingCoupon) {
      return res.status(404).send({
        success: false,
        message: "Coupon not found",
      });
    }

    // If the coupon exists, remove it from the coupons array
    const result = await offerModel.updateOne(
      {},
      {
        $pull: {
          coupons: { name: name },
        },
      }
    );

    // Check if the update operation was successful
    if (result.modifiedCount > 0) {
      res.status(200).send({
        success: true,
        message: "Coupon deleted successfully",
      });
    } else {
      res.status(500).send({
        success: false,
        message: "Failed to delete the coupon",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Delete Coupon Ctrl ${error.message}`,
    });
  }
};

const getAllQueries = async (req, res) => {
  try {
    const queries = await contactModel.find({});
    if (queries.length === 0) {
      return res.status(200).send({
        success: false,
        message: "No Queries Found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Queries fetched success",
      data: queries,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get All Queries Ctrl ${error.message}`,
    });
  }
};

const seenQueryController = async (req, res) => {
  try {
    const queries = await contactModel.findOne({ _id: req.body.id });
    if (!queries) {
      return res.status(200).send({
        success: false,
        message: "No Queries Found",
      });
    }
    const updateQuery = await contactModel.findOneAndUpdate(
      {
        _id: req.body.id,
      },
      { $set: { status: "seen" } },
      { new: true }
    );
    return res.status(201).send({
      success: true,
      message: "Query updated success",
      data: updateQuery,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get All Queries Ctrl ${error.message}`,
    });
  }
};

const VerifyPropertyController = async (req, res) => {
  try {
    const propertyExist = await propertyModel.findOne({ bbId: req.body.bbId });
    if (!propertyExist) {
      return res
        .status(200)
        .send({ success: false, message: "No property found with this ID" });
    }
    const verifyProperty = await propertyModel.findOneAndUpdate(
      {
        bbId: req.body.bbId,
      },
      { $set: { verified: !propertyExist.verified } },
      { new: true }
    );
    if (!verifyProperty) {
      return res.status(201).send({
        success: false,
        message: "Failed to Verify Product",
      });
    }
    return res.status(202).send({
      success: true,
      message: `${
        propertyExist.verified
          ? "Product Unverified"
          : "Product Verified Success"
      }`,
      data: verifyProperty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Verify Property Ctrl ${error.message}`,
    });
  }
};

const AdminGetAllPropertiesController = async (req, res) => {
  try {
    const allProperty = await propertyModel.find({});
    if (allProperty.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No property found" });
    }
    const sanitizedProperties = allProperty.map((property) => {
      const { email, mobile, address, ...sanitizedProperty } =
        property.toObject();
      return sanitizedProperty;
    });
    return res.status(201).send({
      success: true,
      message: "Property Fetched",
      data: allProperty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `get Property Ctrl ${error.message}`,
    });
  }
};

const adminGetDealsController = async (req, res) => {
  try {
    const deals = await dealModel.find({});
    if (deals.length === 0) {
      return res
        .status(200)
        .send({ success: false, message: "No Deals Found" });
    }
    return res
      .status(201)
      .send({ success: true, message: "All Deals Fetched", data: deals });
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: `Get Leads Ctrl ${error.message}` });
  }
};

module.exports = {
  getAllUserController,
  getUserController,
  deleteUserController,
  editUserController,
  sendMailToAllUsersController,
  addBrandController,
  getAllBrandContoller,
  addModelController,
  deleteModelController,
  adminGetAllOrdersController,
  adminUpdateOrderController,
  getShippingChargeController,
  shippingChargeController,
  addCouponController,
  deleteCouponController,
  getAllQueries,
  seenQueryController,
  homeLabelController,
  deleteBrandController,
  VerifyPropertyController,
  AdminGetAllPropertiesController,
  adminGetDealsController,
};
