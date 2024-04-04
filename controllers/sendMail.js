const nodemailer = require("nodemailer");

module.exports = async (email, subject, otp, msg) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: subject,
      text: `${msg} ${otp}`,
    });
  } catch (error) {
    console.log("Email not sent");
    console.log(error);
  }
};
