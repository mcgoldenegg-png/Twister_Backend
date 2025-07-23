const User = require("../models/User");
const { sendVerificationCode } = require("../utils/twilioClient");
const ApiResponse = require("../utils/apiResponse");
const jwt = require("jsonwebtoken");

// Generate random 4-digit code
const generateVerificationCode = () => {
  return "123456"; //Math.floor(100000 + Math.random() * 900000).toString();
};

// Initiate login process
exports.initiateLogin = async (req, res) => {
  try {
    const { phoneNumber, name, countryCode } = req.body;
    console.log('req.body: ', req.body);

    // Find user by phone number
    const user = await User.findOne({ where: { phoneNumber } });

    // If user doesn't exist, create a new unverified user
    if (!user) {
      const verificationCode = generateVerificationCode();
      const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

      const newUser = await User.create({
        countryCode,
        phoneNumber,
        verificationCode,
        verificationCodeExpires,
        isVerified: false,
      });

      // Send verification code via Twilio
      const sendResult = await sendVerificationCode(
        phoneNumber,
        verificationCode
      );
      if (!sendResult.success) {
        return ApiResponse.error(res, "Failed to send verification code", 500);
      }
      return ApiResponse.success(
        res,
        "Verification code sent to registered mobile number",
        {
          countryCode: newUser.countryCode,
          phoneNumber: newUser.phoneNumber,
        }
      );
    }

    // If user exists, generate new verification code
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Update user with new verification code
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send verification code via Twilio
    const sendResult = await sendVerificationCode(
      phoneNumber,
      verificationCode
    );
    if (!sendResult.success) {
      return ApiResponse.error(res, "Failed to send verification code", 500);
    }

    return ApiResponse.success(
      res,
      "Verification code sent to registered mobile number",
      {
        phoneNumber: phoneNumber,
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return ApiResponse.error(res, "Server error during login", 500);
  }
};

// Verify code and complete login
exports.verifyLogin = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    // Find user
    const user = await User.findOne({ where: { phoneNumber } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if code matches and is not expired
    if (
      user.verificationCode !== code ||
      new Date(user.verificationCodeExpires) < new Date()
    ) {
      return ApiResponse.error(
        res,
        "Invalid or expired verification code",
        400
      );
    }

    // Mark user as verified if they weren't already
    if (!user.isVerified) {
      user.isVerified = true;
    }

    // Clear verification data
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return ApiResponse.success(res, "Login successful", {
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    ApiResponse.error(res, "Server error during verification", 500, error);
  }
};
