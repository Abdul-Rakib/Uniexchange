const dealModel = require("../models/dealsModel");
const propertyModel = require("../models/propertyModel");
const sendMail = require("./sendMail");
const nodemailer = require("nodemailer");
const fs = require("fs");

const addDealController = async (req, res) => {
  try {
    const findDeals = await dealModel.find({
      bbId: req.body.bbId,
      userEmail: req.body.userEmail,
      sellerEmail: req.body.sellerEmail,
    });
    if (findDeals.length === 0) {
      const newDeal = new dealModel(req.body);
      await newDeal.save();
      // //! SENDING EMAIL
      try {
        const dynamicData = {
          user: `${req.body.user}`,
          product: `${req.body.product}`,
          subject: `You got a contact access request for ${req.body.product}`,
          msg: `You have a new contact request of your product: ${req.body.product} from ${req.body.user}`,
        };
        let htmlContent = fs.readFileSync("requestContactMail.html", "utf8");
        Object.keys(dynamicData).forEach((key) => {
          const placeholder = new RegExp(`{${key}}`, "g");
          htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
        });
        // Send mail
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
          },
        });
        let mailDetails = {
          from: process.env.EMAIL,
          to: `${req.body.sellerEmail}`,
          subject: "New Contact Request",
          html: htmlContent,
        };
        mailTransporter.sendMail(mailDetails, function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(`mail sent to ${req.body.sellerEmail}`);
          }
        });
      } catch (error) {
        console.error("Error sending email:", error);
      }
      return res
        .status(200)
        .send({ success: true, message: "Contact requested" });
    }

    return res
      .status(201)
      .send({ success: false, message: "Contact already requested" });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getUserDealsController = async (req, res) => {
  try {
    const findDeal = await dealModel.find({
      $or: [{ userEmail: req.body.email }, { sellerEmail: req.body.email }],
    });
    if (findDeal.length === 0) {
      return res
        .status(201)
        .send({ success: false, message: "No deals found" });
    }
    return res.status(200).send({
      success: true,
      message: "Deals Fetched Success",
      data: findDeal,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const giveAccessController = async (req, res) => {
  try {
    const dealExist = await dealModel.findOne({ _id: req.body.id });
    if (!dealExist) {
      return res.status(201).send({ success: false, message: "No deal found" });
    }
    const udpateDeal = await dealModel.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { access: !dealExist.access } },
      { new: true }
    );
    if (!udpateDeal) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to update" });
    }

    // //! SENDING EMAIL
    try {
      const dynamicData = {
        product: `${dealExist?.product}`,
        subject: `Your Contact Request Approved`,
        msg: `Your contact request for product - ${dealExist?.product} is approved`,
      };
      let htmlContent = fs.readFileSync("requestContactMail.html", "utf8");
      Object.keys(dynamicData).forEach((key) => {
        const placeholder = new RegExp(`{${key}}`, "g");
        htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
      });
      // Send mail
      let mailTransporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      });
      let mailDetails = {
        from: process.env.EMAIL,
        to: `${dealExist?.userEmail}`,
        subject: "Contact Request Approved",
        html: htmlContent,
      };
      mailTransporter.sendMail(mailDetails, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(`mail sent to ${req.body.sellerEmail}`);
        }
      });
    } catch (error) {
      console.error("Error sending email:", error);
    }

    return res
      .status(200)
      .send({ success: true, message: "Contact Shared Success" });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getDealerListController = async (req, res) => {
  try {
    const dealers = await dealModel.find({
      sellerEmail: req.body.email,
      bbId: req.body.bbId,
    });
    if (dealers.length === 0) {
      return res
        .status(201)
        .send({ success: false, message: "No dealers found" });
    }
    return res.status(200).send({
      success: true,
      message: "Dealers Fetched Success",
      data: dealers,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const markAsSoldController = async (req, res) => {
  try {
    const { soldTo } = req.body;
    if (soldTo !== "Outside Uniexchange") {
      const deal = await dealModel.findOne({
        bbId: req.body.bbId,
        userEmail: req.body.soldTo,
      });
      if (!deal) {
        return res
          .status(201)
          .send({ success: false, message: "No deal found" });
      }
      const updateDeal = await dealModel.findOneAndUpdate(
        { bbId: req.body.bbId, userEmail: req.body.soldTo },
        { $set: { soldTo: req.body.soldTo, dealDone: true } },
        { new: true }
      );
      if (!updateDeal) {
        return res.status(201).send({
          success: false,
          message: "Failed to udpdate",
        });
      }
      if (updateDeal) {
        const product = await propertyModel.findOne({ bbId: req.body.bbId });
        if (!product) {
          return res
            .status(201)
            .send({ success: false, message: "No deal found" });
        }
        const updateProduct = await propertyModel.findOneAndUpdate(
          { bbId: req.body.bbId },
          { $set: { sold: true } },
          { new: true }
        );
        if (!updateProduct) {
          return res.status(201).send({
            success: false,
            message: "Failed to udpdate",
          });
        }
        // //! SENDING EMAIL
        try {
          const dynamicData = {
            user: `${deal?.user}`,
            product: `${deal?.product}`,
            subject: `Order Successfull`,
            msg: `Your contact request for product - ${deal?.product} is successful`,
          };
          let htmlContent = fs.readFileSync("order.html", "utf8");
          Object.keys(dynamicData).forEach((key) => {
            const placeholder = new RegExp(`{${key}}`, "g");
            htmlContent = htmlContent.replace(placeholder, dynamicData[key]);
          });
          // Send mail
          let mailTransporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.EMAIL_PASS,
            },
          });
          let mailDetails = {
            from: process.env.EMAIL,
            to: `${deal?.userEmail}`,
            subject: "Order Successfull",
            html: htmlContent,
          };
          mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(`mail sent to ${req.body.sellerEmail}`);
            }
          });
        } catch (error) {
          console.error("Error sending email:", error);
        }
        return res.status(200).send({
          success: true,
          message: "Mark as Sold",
        });
      }
    } else {
      const newDeal = new dealModel(req.body);
      await newDeal.save();
      const product = await propertyModel.findOne({ bbId: req.body.bbId });
      if (!product) {
        return res
          .status(201)
          .send({ success: false, message: "No Product found" });
      }
      const updateProduct = await propertyModel.findOneAndUpdate(
        { bbId: req.body.bbId },
        { $set: { sold: true } },
        { new: true }
      );
      if (!updateProduct) {
        return res.status(201).send({
          success: false,
          message: "Failed to udpdate",
        });
      }
      return res.status(200).send({
        success: true,
        message: "Mark as Sold",
      });
    }
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getDealForReviewsController = async (req, res) => {
  try {
    const deals = await dealModel.find({
      userEmail: req.body.userEmail,
      sellerEmail: req.body.sellerEmail,
      soldTo: req.body.userEmail,
    });
    if (deals.length === 0) {
      return res
        .status(201)
        .send({ success: false, message: "No deals found" });
    }
    return res.status(200).send({
      success: true,
      message: "All deals fetched",
      data: deals,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getAllDealsByIdController = async (req, res) => {
  try {
    const deals = await dealModel.find({ bbId: req.body.bbId });
    if (deals.length === 0) {
      return res
        .status(201)
        .send({ success: false, message: "No deals found" });
    }
    return res.status(200).send({
      success: true,
      message: "All deals By Id fetched",
      data: deals,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};
const getOrderHistoryController = async (req, res) => {
  try {
    const orders = await dealModel.find({
      userEmail: req.body.email,
      dealDone: true,
    });
    if (orders?.length === 0) {
      return res.status(201).send({
        success: false,
        message: "No Orders Found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "All Orders Fetched",
      data: orders,
    });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  addDealController,
  getUserDealsController,
  giveAccessController,
  getDealerListController,
  markAsSoldController,
  getDealForReviewsController,
  getAllDealsByIdController,
  getOrderHistoryController,
};
