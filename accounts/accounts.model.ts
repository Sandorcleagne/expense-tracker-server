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
      enum: ["CURRENT", "SAVINGS", "CREDIT_CARD", "CASH", "WALLET"],
    },
    balance: {
      type: Number,
      required: [true, "Account balance is required"],
      default: 0,
    },
    isDefault: {
      type: Boolean,
      required: [true, "Account default is required"],
      default: false,
    },
    accountNumberLast4: {
      type: String,
      trim: true,
      maxlength: 4,
      match: [/^\d{4}$/, "Must be exactly 4 digits"],
    },
    bankCode: {
      type: String,
      trim: true,
      uppercase: true,
      // e.g. "HDFC", "ICICI", "SBI" — matches a static bank-metadata table/JSON
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);
accountSchema.index({ userId: 1 });
export const accountModel = mongoose.model<Account>("Account", accountSchema);
