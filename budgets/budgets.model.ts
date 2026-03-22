import mongoose from "mongoose";
import { Budget } from "./budgets.types.js";

const budgetSchema = new mongoose.Schema<Budget>(
  {
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    lastAlertSent: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const budgetModel = mongoose.model<Budget>("Budget", budgetSchema);
