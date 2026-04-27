import mongoose from "mongoose";
import { Budget } from "./budgets.types.js";

const budgetSchema = new mongoose.Schema<Budget>(
  {
    amount: {
      type: Number,
      required: true,
    },
    spent: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "WEEKLY", "DAILY"],
      required: [true, "Type is required(type)"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastAlertSent: {
      type: Date,
      default: null,
    },
    lastAlertLevel: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true },
);
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });
export const budgetModel = mongoose.model<Budget>("Budget", budgetSchema);
