import jwt from "jsonwebtoken";
import * as crypto from "node:crypto";

import cryptoRandomString from "crypto-random-string";
import asyncHandler from "../utils/asycnHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/tokenUtil.js";
import { User } from "../models/users.js";
import HttpError from "../utils/HttpError.js";
import sendEmail from "../utils/email.js";
import { client } from "../config/redis.js";
import Role from "../models/role.js";
import RefreshToken from "../models/refreshToken.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: "/",
};

const sendToken = async (user, res, deviceInfo, IPAddress) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  // hash refreshToken before storage.
  const hashRefreshToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  // remove old refresh token for the device.
  await RefreshToken.deleteMany({ user: user._id, deviceInfo });
  await RefreshToken.create({
    token: hashRefreshToken,
    user: user._id,
    deviceInfo,
    IPAddress,
    expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  res.cookie("refreshToken", refreshToken, cookieOptions);

  return accessToken;
};

const signUp = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password, role } = req.body;

  const userExist = await User.findOne({ email });
  if (userExist) {
    return next(new HttpError("User already exists", 400));
  }

  const otp = cryptoRandomString({ length: 6, type: "numeric" });
  let userRole;
  if (role) {
    userRole = await Role.findOne({ name: role });
    if (!userRole) {
      return next(new HttpError("Invalid role provided", 400));
    }
  } else {
    userRole = await Role.findOne({ name: "user" });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    role: userRole._id,
  });

  //store otp in redis. expired in 10min.
  await client.setEx(`otp:${user.email}`, 600, otp);

  const data = {
    user: { name: user.firstName, email: user.email },
    otp: otp,
  };
  await sendEmail({
    email: user.email,
    subject: "Email Verification",
    template: "activation",
    date: data,
  });
  const accessToken = await sendToken(user, res);
  const populatedUser = await User.findById(user._id).populate("role", "name");
  res.status(201).json({
    status: "success",
    message: "User created successfully",
    accessToken,
    user: populatedUser,
  });
});

const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;
  // retriev otp from redis.
  const storedOTP = await client.get(`otp:${email}`);
  if (!storedOTP) {
    return next(new HttpError("OTP expired", 400));
  }
  if (storedOTP !== otp) {
    return next(new HttpError("Invalid OTP", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new HttpError("No user found with this email", 404));
  }
  user.emailVerified = true;
  await user.save({ validateBeforeSave: false });
  // delete otp from redis
  await client.del(`otp:${email}`);
  //  TODO =>   send welcome email

  res.status(200).json({
    status: "success",
    message: "Email verified successfully",
  });
});

const requestNewOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HttpError("No user found with this email", 404));
  }
  const newOTRP = cryptoRandomString({ length: 6, type: "numeric" });
  // update otp in redis and expired in 10min
  await client.setEx(`otp:${email}`, 600, newOTRP);
  // TODO => send email with new otp
  const data = {
    user: { name: user.firstName, email: user.email },
    otp: newOTRP,
  };
  await sendEmail({
    email: user.email,
    subject: "Email Verification",
    template: "resendOtp",
    date: data,
  });
  res.status(200).json({
    status: "success",
    message: "New OTP sent to your email",
  });
});

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const IPAddress = req.ip;
  const deviceInfo = req.get("User-Agent"); // get device info from request header.

  if (!email || !password) {
    return next(new HttpError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password +emailVerified +active"
  );

  if (!user) {
    return next(new HttpError("Incorrect user or password", 401));
  }

  const isMatch = await user.comparePassword(password, user.password);
  if (!isMatch) {
    return next(new HttpError("Incorrect user or password", 401));
  }

  const populatedUser = await User.findById(user._id).populate({
    path: "role",
    select: "name -_id",
  });

  if (!user.active) {
    return next(
      new HttpError(
        "Your account is deactivated. Please reactivate your account to login",
        403
      )
    );
  }
  if (user.role.name !== "superAdmin" && !user.emailVerified) {
    return next(new HttpError("Please verify your email to login", 401));
  }

  const accessToken = await sendToken(user, res, deviceInfo, IPAddress);
  res.status(200).json({
    status: "success",
    accessToken,
    user: populatedUser,
  });

  // Add script to update Swagger UI authorization header
  res.send(`\
    <script>
      localStorage.setItem('swagger_access_token', '${accessToken}');
      window.location.href = '/api-docs';
    </script>
  `);
});

const refreshTokenHandler = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new HttpError("No refresh token provided", 401));
  }
  // Verify refresh token
  const decoded = verifyToken(refreshToken, process.env.REFRESH_SECRET);

  // find stored refresh token
  const hashedToken = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const storedToken = await RefreshToken.findOne({
    token: hashedToken,
    user: decoded.id,
  });

  if (!storedToken) {
    return next(new HttpError("Invalid or expired refresh token", 401));
  }
  // Check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new HttpError("User no longer exists", 401));
  }

  // Generate new access token
  const accessToken = generateAccessToken(decoded.id);

  res.status(200).json({
    status: "success",
    accessToken,
  });
});

const restrictTo = function (...roles) {
  return function (req, res, next) {
    const userRole = req.user.role.name;
    if (!roles.includes(userRole)) {
      return next(
        new HttpError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) {
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    await RefreshToken.deleteOne({ token: hashedToken });
    res.clearCookie("refreshToken");
  }

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new HttpError("No user found with this email", 404));
  }
  // generate token.
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // create password reset url
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  const data = {
    user: { name: user.firstName, email: user.email },
    resetUrl,
  };
  await sendEmail({
    email: user.email,
    subject: "Password Reset Request",
    template: "passwordreset",
    date: data,
  });
  res.status(200).json({
    status: "success",
    message: "Password reset link sent to your email",
  });
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  const resetToken = crypto.createHash("sha256").update(token).digest("hex");
  //   find user with the token
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new HttpError("Invalid or Expired token", 400));
  }
  console.log("user", user);
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const accessToken = sendToken(user, res);
  res.status(200).json({
    status: "success",
    message: "Password reset successfully",
    accessToken,
  });
});

const ChangePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(currentPassword, user.password))) {
    return next(new HttpError("Your current password is wrong", 400));
  }
  user.password = newPassword;
  // check if new password is the same as the old password.
  if (user.password === currentPassword) {
    return next(
      new HttpError(
        "Your new password cannot be the same as the old password",
        400
      )
    );
  }

  await user.save();
  const accessToken = sendToken(user, res);
  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
    accessToken,
  });
});

export {
  signUp,
  verifyOTP,
  requestNewOtp,
  login,
  refreshTokenHandler,
  restrictTo,
  logout,
  resetPassword,
  forgotPassword,
  ChangePassword,
};
