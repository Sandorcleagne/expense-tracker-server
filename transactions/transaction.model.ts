import mongoose from "mongoose";
import { Transaction } from "./transaction.types.js";

const transactionSchema = new mongoose.Schema<Transaction>(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["INCOME", "EXPENSE"],
    },
    userId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    receiptUrl: {
      type: String,
      required: true,
    },
    isRecurring: {
      type: Boolean,
      required: true,
    },
    recurringInterval: {
      type: String,
      required: true,
      enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"],
    },
    nextRecurringDate: {
      type: Date,
      required: true,
    },
    lastProcessedDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "COMPLETED", "CANCELLED"],
    },
  },
  { timestamps: true },
);

export const transactionModel = mongoose.model<Transaction>(
  "Transaction",
  transactionSchema,
);
