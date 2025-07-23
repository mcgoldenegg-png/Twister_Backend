require("dotenv").config();
const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const NODE_ENV = process.env.NODE_ENV || "development";

const client = NODE_ENV === "production" ? twilio(accountSid, authToken) : null;

const sendVerificationCode = async (phoneNumber, code) => {
  try {
    // In development, use default code 1234 and skip Twilio
    if (NODE_ENV !== "production") {
      console.log(`[DEV] Verification code for ${phoneNumber}: 1234`);
      return {
        success: true,
        messageSid: "dev-mock-message-id",
        code: "1234", // Return the default code for development
      };
    }

    // In production, send real SMS via Twilio
    const message = await client.messages.create({
      body: `Your verification code is: ${code}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    return {
      success: true,
      messageSid: message.sid,
      code: code, // Return the actual code for production
    };
  } catch (error) {
    console.error("Twilio error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendVerificationCode };
