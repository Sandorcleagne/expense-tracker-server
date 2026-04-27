import mongoose from "mongoose";
import { Account } from "./accountstypes.js";

const accountSchema = new mongoose.Schema<Account>(
  {
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Account type is required"],
      trim: true,
      enum: ["CURRENT", "SAVING"],
    },
    balance: {
      type: Number,
      required: [true, "Account balance is required"],
      default: 0,
    },
    isDefault: {
      type: Boolean,
      required: [true, "Account default is required"],
      trim: true,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);
accountSchema.index({ userId: 1 });
export const accountModel = mongoose.model<Account>("Account", accountSchema);
