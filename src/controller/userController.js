import cryptoRandomString from "crypto-random-string";
import jwt from "jsonwebtoken";
import Role from "../models/role.js";
import { User } from "../models/users.js";
import asyncHandler from "../utils/asycnHandler.js";
import HttpError from "../utils/HttpError.js";
import { client } from "../config/redis.js";
import sendEmail from "../utils/email.js";

const updateMe = asyncHandler(async (req, res, next) => {
  // create error if user POSTs password data.
  if (req.body.password) {
    return next(
      new HttpError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }
  // update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });
  const populatedUser = await User.findById(updateUser._id).populate({
    path: "role",
    select: "name -_id",
  });
  res.status(200).json({
    status: "success",
    user: populatedUser,
  });
});
const deleteme = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

const myInfo = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const populatedUser = await User.findById(user._id).populate({
    path: "role",
    select: "name -_id",
  });
  res.status(200).json({
    status: "success",
    user: populatedUser,
  });
});
const requestEmailUpdate = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  // Validate input.
  if (!email) {
    return next(new HttpError("Email is required", 400));
  }
  // Decode the token
  // const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // Find the user
  const user = await User.findOne({ email });
  // await User.findById(decoded.id);
  if (!user) {
    return next(new HttpError("User not found", 404));
  }
  // Check if email is already taken.
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new HttpError("Email already in use", 400));
  }
  // Generate confirmation token.
  const confirmationToken = user.createPasswordResetToken();
  // Set the pending email
  user.pendingEmail = email;

  // Save user without validation
  await user.save({ validateBeforeSave: false });

  // Generate confirmation URL
  const confirmationUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/user/confirmEmailChange?token=${confirmationToken}`;

  // Email data
  const data = {
    user: { name: user.firstName, email: user.email },
    confirmationUrl,
  };

  // Send email
  await sendEmail({
    email: user.email,
    subject: "Confirm Email Change Request",
    template: "emailUpdateNotification",
    date: data,
  });

  res.status(200).json({
    status: "success",
    message: "Confirmation email sent to your email",
  });
});

const confirmEmailChange = asyncHandler(async (req, res, next) => {
  const { token } = req.query;
  if (!token) {
    return next(new HttpError("Invalid token", 400));
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new HttpError("Token is invalid or has expired", 400));
  }
  if (!user.pendingEmail) {
    return next(new HttpError("Token is invalid or has expired", 400));
  }
  // generate  otp and store in  redis.
  const newOTRP = cryptoRandomString({ length: 6, type: "numeric" });
  await client.setEx(`otp:${user.pendingEmail}`, 600, newOTRP);
  // on sucess clear  tokend, pedning email and update email.
  // user.email = user.pendingEmail;
  // user.pendingEmail = undefined;
  // user.passwordResetToken = undefined;
  // user.passwordResetExpires = undefined;
  await user.save();
  const data = {
    user: { name: user.firstName, email: user.pendingEmail },
    otp: otp,
  };
  await sendEmail({
    email: user.pendingEmail,
    subject: "Email Verification",
    template: "activation",
    date: data,
  });
  const accessToken = sendToken(user, res);
  res.status(200).json({
    sttaus: "sucess",
    accessToken,
    message: "Verification OTP sent  to your nw email",
  });
});

const getAllUser = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new HttpError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    user,
  });
});
const getUserByEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) {
    return next(new HttpError("No user found with that email", 404));
  }
  res.status(200).json({
    status: "success",
    user,
  });
});

// assign role to user.
const assignRoleToUser = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    return next(new HttpError("No user found with that ID", 404));
  }
  const role = await Role.findById(roleId);
  if (!role) {
    return next(new HttpError("No role found with that ID", 404));
  }
  //  update user role.
  user.role = role;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "Role assigned to user successfully",
    user,
  });
});
// assign permission to user.
export {
  updateMe,
  deleteme,
  myInfo,
  getAllUser,
  getUser,
  getUserByEmail,
  assignRoleToUser,
  requestEmailUpdate,
  confirmEmailChange,
};
