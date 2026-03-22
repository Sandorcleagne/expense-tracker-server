import { Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { CustomRequest } from "../types.js";
import { response } from "../utils/responseTemplate.js";
import createHttpError from "http-errors";
import { transactionModel } from "./transaction.model.js";
import { accountModel } from "../accounts/accounts.model.js";

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
      recurringInterval,
      nextRecurringDate,
      lastProcessedDate,
      status,
    } = req.body;
    if (
      !type ||
      !amount ||
      !accountId ||
      !description ||
      !category ||
      !receiptUrl ||
      !isRecurring ||
      !recurringInterval ||
      !nextRecurringDate ||
      !lastProcessedDate ||
      !status
    ) {
      const error = createHttpError(400, "All fields are required");
      return next(error);
    }
    const account = await accountModel.findById(accountId);
    if (!account) {
      const error = createHttpError(404, "Account not found");
      return next(error);
    }
    if (account.userId !== req.user?._id) {
      const error = createHttpError(403, "Unauthorized");
      return next(error);
    }
    const transaction = await transactionModel.create({
      type,
      amount,
      accountId,
      description,
      category,
      receiptUrl,
      isRecurring,
      recurringInterval,
      nextRecurringDate,
      lastProcessedDate,
      status,
      userId: req.user?._id,
    });
    const createdTransaction = await transactionModel.findById(
      transaction?._id,
    );
    if (!createdTransaction) {
      const error = createHttpError(
        500,
        "Something went wrong please try again",
      );
      return next(error);
    }
    res
      .status(200)
      .json(
        response(true, "Transaction created successfully", createdTransaction),
      );
  },
);
