import mongoose from "mongoose";
import { Account } from "./accountstypes.js";

const accountSchema = new mongoose.Schema<Account>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["CURRENT", "SAVING"],
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      required: true,
      trim: true,
      default: false,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const accountModel = mongoose.model<Account>("Account", accountSchema);
