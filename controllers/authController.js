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
    const user = await User.findOne({ where: { phoneNumber } });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      user.verificationCode !== code ||
      new Date(user.verificationCodeExpires) < new Date()
    ) {
      return ApiResponse.error(res, "Invalid or expired verification code", 400);
    }

    if (!user.isVerified) user.isVerified = true;

    user.verificationCode = null;
    user.verificationCodeExpires = null;
    user.lastLogin = new Date();
    await user.save();

    const payload = { userId: user.id, phoneNumber: user.phoneNumber };

    const jwtAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    const jwtRefreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    });

    return ApiResponse.success(res, "Login successful", {
      jwtAccessToken,
      jwtRefreshToken,
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

// Refresh JWT token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};


