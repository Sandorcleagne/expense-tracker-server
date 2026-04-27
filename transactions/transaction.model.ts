import mongoose from "mongoose";
import { Transaction } from "./transaction.types.js";

const transactionSchema = new mongoose.Schema<Transaction>(
  {
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
    },

    amount: { type: Number, required: true },

    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "FOOD",
        "RENT",
        "TRAVEL",
        "SHOPPING",
        "ENTERTAINMENT",
        "BILLS",
        "HEALTH",
        "SALARY",
        "FREELANCE",
        "INVESTMENT",
        "LOAN",
        "GIFT",
        "OTHER",
      ],
      required: true,
    },

    receiptUrl: String,

    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
      default: "COMPLETED",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    isRecurring: { type: Boolean, default: false },

    recurringInterval: {
      type: String,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
      required: function () {
        return this.isRecurring;
      },
    },

    nextRecurringDate: {
      type: Date,
      required: function () {
        return this.isRecurring;
      },
    },

    lastProcessedDate: Date,
  },
  { timestamps: true },
);
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ nextRecurringDate: 1 });
export const transactionModel = mongoose.model<Transaction>(
  "Transaction",
  transactionSchema,
);
