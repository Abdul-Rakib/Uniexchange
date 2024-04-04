const dotenv = require("dotenv");
const axios = require("axios");
// dotenv
dotenv.config();
const api_key = process.env.FAST_2_SMS_API_KEY;

module.exports = async (otp, number) => {
  try {
    const smsdata = {
      sender_id: "FSTSMS",
      message: otp,
      langauage: "english",
      route: "p",
      numbers: number,
    };
    return axios.post("https://www.fast2sms.com/dev/bulkV2", smsdata, {
      headers: {
        Authorization: api_key,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
