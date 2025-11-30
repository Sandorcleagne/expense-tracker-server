import mongoose from "mongoose";
import { User } from "./usertypes.js";
import bcrypt from "bcrypt";
import { config } from "../config/config.js";
import jwt, { SignOptions } from "jsonwebtoken";
const userSchema = new mongoose.Schema<User>(
  {
    fullName: {
      type: String,
      require: [true, "fullName is required"],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local"; // only required for local users
      },
      trim: true,
    },
    email: {
      type: String,
      require: [true, "Email is required"],
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (this: User, next) {
  if (!this.isModified("password") || this.provider !== "local") {
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
});
userSchema.methods.isPasswordCorrect = async function (password: string) {
  try {
    return bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }
};
userSchema.methods.generateAccesstoken = async function () {
  if (!config.ACCESS_TOKEN_SECRETE)
    throw new Error("ACCESS_TOKEN_SECRETE is required");

  const payload = { _id: this._id, email: this.email };
  const options: SignOptions = {
    expiresIn: (config.ACCESS_TOKEN_EXPIRY || "5h") as `${number}${
      | "s"
      | "m"
      | "h"
      | "d"
      | "w"}`,
  };

  return jwt.sign(payload, config.ACCESS_TOKEN_SECRETE, options);
};
userSchema.methods.generateRefreshToken = async function () {
  if (!config.REFRESH_TOKEN_SECRETE) {
    throw new Error("REFRESH_TOKEN_SECRETE is required");
  }

  const payload = { _id: this._id };

  // Ensure expiresIn is a valid type: number (seconds) or StringValue ("1d", "7d", etc.)
  const options: SignOptions = {
    expiresIn: (config.REFRESH_TOKEN_EXPIRY || "1d") as `${number}${
      | "s"
      | "m"
      | "h"
      | "d"
      | "w"}`,
  };

  return jwt.sign(payload, config.REFRESH_TOKEN_SECRETE, options);
};
export default mongoose.model<User>("User", userSchema);
