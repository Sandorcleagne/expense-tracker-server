import { Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { CustomRequest } from "../types.js";
import { response } from "../utils/responseTemplate.js";
import createHttpError from "http-errors";
import { transactionModel } from "./transaction.model.js";
import { accountModel } from "../accounts/accounts.model.js";
import { budgetModel } from "../budgets/budgets.model.js";
import userModel from "../users/user.model.js";
import { sendBudgetAlertEmail } from "../utils/sendMail.js";
import mongoose from "mongoose";

const BUDGET_ALERT_THRESHOLDS = [100, 80, 60] as const;

export const createTransaction = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const {
      type,
      amount,
      accountId,
      description,
      category,
      receiptUrl,
      isRecurring,
      recurringInterval = null,
      nextRecurringDate = null,
      lastProcessedDate = null,
      status,
    } = req.body;
    if (
      !type ||
      !amount ||
      !accountId ||
      !description ||
      !category ||
      !status
    ) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }
    if (isRecurring && !nextRecurringDate && !recurringInterval) {
      const error = createHttpError(
        400,
        "Please provide next recurring date and recurring interval",
      );
      return next(error);
    }
    const account = await accountModel.findById(accountId);
    if (!account) {
      const error = createHttpError(404, "Account not found");
      return next(error);
    }
    if (!account.userId.equals(req.user._id)) {
      const error = createHttpError(403, "Unauthorized");
      return next(error);
    }
    const modifiedType = req.body.type.toUpperCase();
    if (!["INCOME", "EXPENSE"].includes(modifiedType)) {
      const error = createHttpError(400, "Invalid type");
      return next(error);
    }
    if (modifiedType === "EXPENSE" && account.balance < amount) {
      const error = createHttpError(400, "Insufficient balance");
      return next(error);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const transaction = await transactionModel.create(
        [
          {
            ...req.body,
            userId: req.user?._id,
          },
        ],
        { session },
      );

      if (transaction?.[0]?.status === "COMPLETED") {
        // Update account balance
        await accountModel.findByIdAndUpdate(
          accountId,
          {
            $inc: {
              balance: modifiedType === "INCOME" ? amount : -amount,
            },
          },
          { session },
        );

        // If EXPENSE, deduct from budget and check thresholds
        let budgetAlert: {
          budgetId: string;
          type: string;
          usagePercent: number;
          alertLevel: number;
          budgetAmount: number;
          spent: number;
        } | null = null;

        if (modifiedType === "EXPENSE") {
          // Find the user's single budget
          const budget = await budgetModel.findOne(
            { userId: req.user?._id },
            null,
            { session },
          );

          if (budget) {
            // Increment the spent amount on the budget
            const updatedBudget = await budgetModel.findByIdAndUpdate(
              budget._id,
              { $inc: { spent: amount } },
              { session, new: true },
            );

            if (updatedBudget) {
              const usagePercent =
                (updatedBudget.spent / updatedBudget.amount) * 100;
              const previousAlertLevel = updatedBudget.lastAlertLevel ?? 0;

              // Check each threshold (100%, 80%, 60%) — sorted descending
              // so we capture the highest newly-crossed threshold
              for (const threshold of BUDGET_ALERT_THRESHOLDS) {
                if (
                  usagePercent >= threshold &&
                  previousAlertLevel < threshold
                ) {
                  // Update the lastAlertLevel and lastAlertSent on the budget
                  await budgetModel.findByIdAndUpdate(
                    budget._id,
                    {
                      lastAlertLevel: threshold,
                      lastAlertSent: new Date(),
                    },
                    { session },
                  );

                  budgetAlert = {
                    budgetId: String(updatedBudget._id),
                    type: updatedBudget.type,
                    usagePercent: Math.round(usagePercent * 100) / 100,
                    alertLevel: threshold,
                    budgetAmount: updatedBudget.amount,
                    spent: updatedBudget.spent,
                  };

                  // Only trigger the highest newly-crossed threshold
                  break;
                }
              }
            }
          }
        }

        await session.commitTransaction();
        session.endSession();

        // Send budget alert email (fire-and-forget, don't block response)
        if (budgetAlert) {
          const user = await userModel
            .findById(req.user?._id)
            .select("email fullName");
          if (user?.email) {
            sendBudgetAlertEmail({
              to: user.email,
              userName: user.fullName || "User",
              alertLevel: budgetAlert.alertLevel,
              budgetAmount: budgetAlert.budgetAmount,
              spent: budgetAlert.spent,
              usagePercent: budgetAlert.usagePercent,
              budgetType: budgetAlert.type,
            }).catch((err) => {
              console.error("Failed to send budget alert email:", err);
            });
          }
        }

        res.status(200).json(
          response(true, "Transaction created successfully", {
            transaction: transaction[0],
            ...(budgetAlert && { budgetAlert }),
          }),
        );
        return;
      }

      await session.commitTransaction();
      session.endSession();
      res
        .status(200)
        .json(
          response(true, "Transaction created successfully", transaction[0]),
        );
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      const error = createHttpError(
        500,
        err?.message ?? "something went wrong",
      );
      return next(error);
    }
  },
);

export const getAllTransactions = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { type, status, limit = 10, skip = 0 } = req.query;

    let query: any = { userId: req.user?._id };
    if (type) query.type = type;
    if (status) query.status = status;
    const transactions = await transactionModel
      .find(query)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });
    const totalCount = await transactionModel.countDocuments(query);
    if (!transactions || totalCount === 0) {
      return res.status(200).json(response(true, "No Transactions found", {}));
    }
    res.status(200).json(
      response(true, "Transactions fetched successfully", {
        totalCount,
        transactions,
      }),
    );
  },
);
