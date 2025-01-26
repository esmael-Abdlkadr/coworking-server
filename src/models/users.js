import { Schema, model, Document } from "mongoose";
import validator from "validator";
import {
  generatePasswordResetToken,
  hashPassword,
  comparePassword,
} from "../utils/authUtil.js";
const UserRole = {
  Admin: "admin",
  user: "user",
  superAdmin: "superAdmin",
};

const userScheme = new Schema(
  {
    firstName: {
      type: String,
      // required: function () {
      //   return this.role !== UserRole.superAdmin;
      // },
    },
    lastName: {
      type: String,
      // required: function () {
      //   return this.role !== UserRole.superAdmin;
      // },
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [function() {
        return !this.googleId && !this.githubId;
      }, "Please provide your password"],
      minlength: 4,
      select: false,
    },
    photo: String,
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    permissions: [
      {
        type: [Schema.Types.ObjectId],
        ref: "Permission",
        default: [],
      },
    ],

    active: {
      type: Boolean,
      default: true,
    },
    bookmarkedBlogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "Blog",
      },
    ],
    googleId: String,
    githubId: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetExpires: Date,
    passwordResetToken: String,
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
      versionKey: false, // Exclude __v
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false, // Exclude __v
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
      },
    },
  }
);
// userScheme.pre("save", async function (next) {
//   try {
//     if (this.role && this.role.toString() !== "superAdmin") {
//       if (!this.firstName) {
//         return next(new Error("Please provide your first name"));
//       }
//       if (!this.lastName) {
//         return next(new Error("Please provide your last name"));
//       }
//     }

//     next();
//   } catch (error) {
//     console.log(error);
//   }
// });

// hash password before saving
userScheme.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await hashPassword(this.password);
    if (!this.role) {
      const userRole = await model("Role").findOne({ name: "user" });
      this.role = userRole._id;
    }
    next();
  } catch (error) {
    console.log(error);
  }
});

// password compare method

userScheme.methods.comparePassword = comparePassword;
// password reset token generator
userScheme.methods.createPasswordResetToken = function () {
  const { resetToken, hashedToken, expires } = generatePasswordResetToken();
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = expires;
  return resetToken;
};

// check if password reset token is valid
userScheme.methods.isResetTokenValid = function () {
  return this.passwordResetExpires && this.passwordResetExpires > new Date();
};

// serialize user object
userScheme.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

const User = model("User", userScheme);
export { User, UserRole };
