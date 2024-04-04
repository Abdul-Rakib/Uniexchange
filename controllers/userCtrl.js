const userModel = require("../models/userModel");
const dealModel = require("../models/dealsModel");
const subscribeModel = require("../models/subcribeModel");
const propertyModel = require("../models/propertyModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const sendSMS = require("./sendSMS");
const fs = require("fs");

// Admin callback
const adminController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Credentials" });
    }

    const isAdmin = user.isAdmin || false; // If isAdmin is undefined, default to false

    const token = jwt.sign({ id: user._id, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

const registerEmailOtpController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({
      $or: [
        { email: req.body.email },
        { mobile: req.body.mobile },
        { uniID: req.body.uniID },
      ],
    });
    if (existingUser) {
      let matchedField;
      if (existingUser.email === req.body.email) {
        matchedField = "email";
      } else if (existingUser.mobile === req.body.mobile) {
        matchedField = "mobile";
      } else if (existingUser.uniID === req.body.uniID) {
        matchedField = "University ID";
      }
      return res.status(200).send({
        success: false,
        message: `${matchedField} already exists`,
      });
    }

    const generateOTP = () => {
      return Math.floor(100000 + Math.random() * 900000).toString();
    };
    const otp = generateOTP();
    const subject = "Email Verification OTP";
    const msg = `Your Email Verification OTP is`;
    await sendMail(req.body.email, subject, otp, msg);
    return res
      .status(200)
      .send({ success: true, message: "OTP sent successfully", data: otp });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

// register callback
const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({
      $or: [
        { email: req.body.email },
        { mobile: req.body.mobile },
        { uniID: req.body.uniID },
      ],
    });

    if (existingUser) {
      let matchedField;
      if (existingUser.email === req.body.email) {
        matchedField = "email";
      } else if (existingUser.mobile === req.body.mobile) {
        matchedField = "mobile";
      } else if (existingUser.uniID === req.body.uniID) {
        matchedField = "uniID";
      }
      return res.status(200).send({
        success: false,
        message: `User already exists with matching field: ${matchedField}`,
      });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    const subject = "Registration Successfull";
    const msg = "Thank you for registering at Uni Exchange.";
    await sendMail(req.body.email, subject, "", msg);
    //! Adding user in subscriber collection
    // Check if the user is already a subscriber
    const existingSubscriber = await subscribeModel.findOne({
      email: req.body.email,
    });
    // If the user is not a subscriber, add them to the subscriber collection
    if (!existingSubscriber) {
      const newSubscriber = new subscribeModel({ email: req.body.email });
      await newSubscriber.save();
    }
    res.status(201).send({ success: true, message: "Registration Successful" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    if (isMatch) {
      user.lastLogin = new Date();
      await user.save();
    }
    return res
      .status(200)
      .send({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

const otpLoginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ mobile: req.body.mobile });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User not found" });
    }
    // token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .send({ success: true, message: "Login Successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

const getHomeCountController = async (req, res) => {
  try {
    const productCount = await propertyModel.countDocuments({ verified: true });
    const userCount = await userModel.countDocuments({});
    const dealsCount = await dealModel.countDocuments({ dealDone: true });
    return res.status(200).send({
      success: true,
      message: "Data Fetched",
      data: { productCount, userCount, dealsCount },
    });
  } catch (error) {
    return res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

// Get User callback
const getUserController = async (req, res) => {
  try {
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          gender: req.body.gender,
          dob: req.body.dob,
          state: req.body.state,
          city: req.body.city,
          class: req.body.class,
        },
      },
      { new: true }
    );
    if (!user) {
      res.status(200).send({ success: false, message: "Failed to update" });
    }
    res
      .status(201)
      .send({ success: true, success: "Profile Updated Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Login Controller ${error.message}`,
    });
  }
};

// Auth Callback
const authController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    } else {
      res.status(200).send({ success: true, data: user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Auth Error", error });
  }
};

const updateUserController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (!existingUser) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const userUpdate = await userModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        $push: { address: req.body.address },
      },
      { new: true }
    );
    if (!userUpdate) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to Update" });
    }
    res.status(202).send({
      success: true,
      message: "Profile Updated Successfully",
      data: userUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: `Update Ctrl ${error.message}` });
  }
};

const userProfileUpdateController = async (req, res) => {
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res.status(200).send({
        success: false,
        message: "User Not Found",
      });
    }
    // IMAGE
    if (req.file) {
      if (userExist.image) {
        fs.unlink(userExist.image, (err) => {
          if (err) {
            console.error(`Error deleting previous image: ${err.message}`);
          }
        });
      }
      const imagePath = req.file.path;
      const updateImg = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { image: imagePath } }
      );
      if (!updateImg) {
        return res.status(201).send({
          success: false,
          message: "Failed to update image",
        });
      }
    }
    // PASSWORD
    if (req.body.password) {
      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userUpdate = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { password: hashedPassword } },
        { new: true }
      );
      if (!userUpdate) {
        return res.status(201).send({
          success: false,
          message: "Failed to update password",
        });
      }
    }
    return res.status(202).send({
      success: true,
      message: "Profile Updated Successfully",
      // data: userUpdate,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `User Profile Update Ctrl ${error.message}`,
    });
  }
};

// get all users
const getAllUserController = async (req, res) => {
  try {
    users = await userModel.find({
      email: { $ne: "aashirdigital@gmail.com" },
      gender: req.body.gender,
      isVerified: "Yes",
      isDeleted: "No",
    });
    if (users.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No User Found",
      });
    }
    if (!Array.isArray(users)) {
      // Ensure users is an array
      users = [users];
    }
    res.status(200).send({
      success: true,
      message: "User Fetched Successful",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Get All User Controller ${error.message}`,
    });
  }
};

// Delete all users
const DeleteUserController = async (req, res) => {
  try {
    const user = await userModel.findOneAndDelete({ _id: req.body.userId });
    if (!user) {
      return res.status(200).send({
        success: false,
        message: "No User Found",
      });
    }
    res.status(200).send({
      success: true,
      message: "User Deleted Successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: true,
      message: `Delete User Controller ${error.message}`,
    });
  }
};

// Send Mail
const sendMailController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Email Not Registered With Us" });
    }
    const emailOtp = Math.floor(100000 + Math.random() * 900000);
    const savedOtpUser = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { emailOtp: emailOtp } },
      { new: true }
    );
    if (!savedOtpUser) {
      return res
        .status(201)
        .send({ success: false, message: "Error In saving Otp" });
    }
    await sendMail(
      savedOtpUser?.email,
      "Email Verification OTP",
      emailOtp,
      req.body.msg
    );
    return res.status(203).send({
      success: true,
      message: "Otp Send Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Send Mail Controller ${error.message}`,
    });
  }
};
// Verify Email OTP
const verifyOtpController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    if (user.emailOtp !== req.body.userEnteredOtp) {
      return res
        .status(201)
        .send({ success: false, message: "Failed: Incorrect OTP" });
    } else {
      const updateUser = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { isActive: "Yes" } },
        { new: true }
      );
      if (!updateUser) {
        return res
          .status(200)
          .send({ success: false, message: "Failed to Verify" });
      }
      return res.status(202).send({
        success: true,
        message: "Email Verification Successful",
        data: user,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Verify Otp Controller ${error.message}`,
    });
  }
};

// send mobile sms otp
const sendSMSController = async (req, res) => {
  try {
    const { email, mobile } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res
        .status(200)
        .send({ success: false, message: "Email Not Registered With Us" });
    }
    const smsOTP = Math.floor(100000 + Math.random() * 900000);
    await sendSMS(smsOTP, mobile);
    const savedOtpUser = await userModel.findOneAndUpdate(
      { email: email },
      { $set: { mobileOtp: smsOTP, mobile: mobile } },
      { new: true }
    );
    if (!savedOtpUser) {
      return res
        .status(201)
        .send({ success: false, message: "Error In saving Otp" });
    }
    return res.status(202).send({
      success: true,
      message: "Otp Send Successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Send Mail Controller ${error.message}`,
    });
  }
};

const verifyMobileController = async (req, res) => {
  const message =
    req.body.message === "Profile"
      ? "Profile Created Successfully"
      : "Mobile Verified Successfully";
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }

    if (userExist.mobileOtp !== req.body.otp) {
      return res.status(200).send({ success: false, message: "Incorrect OTP" });
    } else {
      const updateUser = await userModel.findOneAndUpdate(
        { email: req.body.email },
        { $set: { mobileVerified: "Yes" } },
        { new: true }
      );
      if (!updateUser) {
        return res
          .status(200)
          .send({ success: false, message: "Failed to Verify" });
      }
      return res.status(202).send({
        success: true,
        message: message,
        data: updateUser,
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: `Verify Mobile Ctrl ${error.message}` });
  }
};

const updatePassController = async (req, res) => {
  try {
    const userExist = await userModel.findOne({ email: req.body.email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const password = req.body.pass;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.findOneAndUpdate(
      { email: req.body.email },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!user) {
      return res
        .status(201)
        .send({ success: false, message: "Failed to update password" });
    }
    res
      .status(202)
      .send({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Update Pass Controller ${error.message}`,
    });
  }
};

const subscribeController = async (req, res) => {
  try {
    const emailExist = await subscribeModel.findOne({ email: req.body.email });
    if (emailExist) {
      return res.status(200).send({
        success: false,
        message: "You have been successfully subscribed to us.",
      });
    }
    const newEmail = new subscribeModel(req.body);
    await newEmail.save();
    return res.status(201).send({
      success: true,
      message: "You have been successfully subscribed to us.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Subcribe Controller ${error.message}`,
    });
  }
};

const unsubscribeController = async (req, res) => {
  try {
    const emailExist = await subscribeModel.findOne({ email: req.body.email });
    if (!emailExist) {
      return res
        .status(200)
        .send({ success: false, message: "Email not found" });
    }
    const unsubscribe = await subscribeModel.findOneAndUpdate(
      {
        email: req.body.email,
      },
      { $set: { allowed: false } },
      { new: true }
    );
    return res.status(201).send({
      success: true,
      message: "You have been successfully unsubscribed.",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Unsubscribe Controller ${error.message}`,
    });
  }
};

const getAllSubscribersController = async (req, res) => {
  try {
    const subscribers = await subscribeModel.find({ allowed: true });
    if (subscribers?.length === 0) {
      return res.status(200).send({
        success: false,
        message: "No Result Found",
      });
    }
    return res.status(201).send({
      success: true,
      message: "Result Fetched Success.",
      data: subscribers,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Get All Subscribers Controller ${error.message}`,
    });
  }
};

const dashboardCountController = async (req, res) => {
  try {
    const propertyCount = await propertyModel.countDocuments({
      email: req.body.email,
    });

    const soldProduct = await propertyModel.countDocuments({
      email: req.body.email,
      sold: true,
    });

    const user = await userModel.findOne({ email: req.body.email });
    let wishlistCount; // Declare wishlistCount at the function level
    if (user) {
      wishlistCount = user.wishlist.length; // Remove the 'let' keyword here
    } else {
      wishlistCount = 0; // Assuming you want to set wishlistCount to 0 when the user is not found
    }

    res.status(200).send({
      success: true,
      data: {
        properties: propertyCount,
        wishlist: wishlistCount,
        soldProduct: soldProduct,
      },
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Dashboard Count Controller ${error.message}`,
    });
  }
};

const addToWishlistController = async (req, res) => {
  try {
    const { email, bbId } = req.body;
    const userExist = await userModel.findOne({ email: email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    const propertyExists = userExist.wishlist.some(
      (item) => item.bbId === bbId
    );

    if (propertyExists) {
      return res
        .status(201)
        .send({ success: false, message: "Already in Wishlist" });
    }
    const property = req.body;
    userExist.wishlist.push(property);
    userExist.save();
    return res
      .status(202)
      .send({ success: true, message: "Property Added Succesfully" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `Add to Wishlist Controller ${error.message}`,
    });
  }
};

const removeFromWishlistController = async (req, res) => {
  try {
    const { email, bbId } = req.body;
    const userExist = await userModel.findOne({ email: email });
    if (!userExist) {
      return res
        .status(200)
        .send({ success: false, message: "User Not Found" });
    }
    // Filter out the property with the specified bbId
    userExist.wishlist = userExist.wishlist.filter(
      (item) => item.bbId !== bbId
    );
    userExist.save();
    return res
      .status(202)
      .send({ success: true, message: "Property Remove from Wishlist" });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Add to Wishlist Controller ${error.message}`,
    });
  }
};

const getSellerController = async (req, res) => {
  try {
    const seller = await userModel.findOne({
      email: req.body.email,
    });
    // $or: [{ email: req.body.email }, { profileId: req.body.profileId }],

    if (!seller) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "User fetched",
      data: seller,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const getSellerProfileController = async (req, res) => {
  try {
    const seller = await userModel.findOne({
      profileId: req.body.profileId,
    });
    // $or: [{ email: req.body.email }, { profileId: req.body.profileId }],

    if (!seller) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }
    return res.status(200).send({
      success: true,
      message: "User fetched",
      data: seller,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const addReviewController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.sellerEmail });
    if (!user) {
      return res.status(201).send({
        success: false,
        message: "No user found",
      });
    }
    const bbId = req.body.bbId; // Assuming bbId is sent in the request body
    // Check if the review with the same bbId already exists
    const existingReviewIndex = user.reviews.findIndex(
      (review) => review.bbId === bbId
    );
    if (existingReviewIndex !== -1) {
      return res.status(201).send({
        success: false,
        message: "You have already given review for this product",
      });
    }
    // Update the user's reviews array
    const updateUserReview = await userModel.findOneAndUpdate(
      { email: req.body.sellerEmail },
      { $push: { reviews: req.body } },
      { new: true }
    );

    if (!updateUserReview) {
      return res.status(201).send({
        success: false,
        message: "Failed to add review",
      });
    }
    const msg =
      "Hurray! You have got a review of your Sold Product. Please login to check it now.";
    await sendMail(req.body.sellerEmail, "Got a review!", "", msg);

    return res.status(200).send({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

const checkMobileNumberController = async (req, res) => {
  try {
    const mobile = await userModel.findOne({ mobile: req.body.mobile });
    if (!mobile) {
      return res.status(201).send({
        success: false,
        message: "Mobile Number not registered with us",
      });
    }
    const smsOTP = Math.floor(100000 + Math.random() * 900000);
    await sendSMS(smsOTP, req.body.mobile);

    const savedOtpUser = await userModel.findOneAndUpdate(
      { mobile: req.body.mobile },
      { $set: { mobileOtp: smsOTP } },
      { new: true }
    );
    if (!savedOtpUser) {
      return res
        .status(201)
        .send({ success: false, message: "Error In saving Otp" });
    }
    return res.status(200).send({
      success: true,
      message: "Otp Sent Successfully",
      data: smsOTP,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: `Check Mobile Number Ctrl ${error.message}`,
    });
  }
};

module.exports = {
  loginController,
  registerEmailOtpController,
  registerController,
  authController,
  getAllUserController,
  DeleteUserController,
  getUserController,
  sendMailController,
  verifyOtpController,
  updatePassController,
  updateUserController,
  verifyMobileController,
  sendSMSController,
  adminController,
  subscribeController,
  unsubscribeController,
  userProfileUpdateController,
  getAllSubscribersController,
  dashboardCountController,
  addToWishlistController,
  removeFromWishlistController,
  getSellerController,
  addReviewController,
  getSellerProfileController,
  checkMobileNumberController,
  otpLoginController,
  getHomeCountController,
};
