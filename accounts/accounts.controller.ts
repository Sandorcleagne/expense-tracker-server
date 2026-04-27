import { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { CustomRequest } from "../types.js";
import { response } from "../utils/responseTemplate.js";
import createHttpError from "http-errors";
import { accountModel } from "./accounts.model.js";

export const createAccount = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { name = "", type = "", balance = 0, isDefault = false } = req.body;
    if ([name, type].some((field) => field?.trim() === "")) {
      const error = createHttpError(400, "All Feilds are required");
      return next(error);
    }
    const account = await accountModel.create({
      name,
      type,
      balance,
      isDefault,
      userId: req.user?._id,
    });
    const createdAccount = await accountModel.findById(account?._id);
    if (!createdAccount) {
      const error = createHttpError(
        500,
        "Something went wrong please try again",
      );
      return next(error);
    }
    res
      .status(200)
      .json(response(true, "Account created successfully", createdAccount));
  },
);

export const getUserAccounts = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const accounts = await accountModel.find({ userId: req.user?._id });
    if (!accounts || accounts.length === 0) {
      res.status(200).json(response(true, "No accounts found", []));
    }
    res
      .status(200)
      .json(response(true, "Accounts fetched successfully", accounts));
  },
);

export const updateAccount = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { accountId, name, type, balance, isDefault } = req.body;
    if (!accountId) {
      const error = createHttpError(400, "Account ID is required");
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

    // Build update object — only patch fields that were provided
    const updateFields: Record<string, unknown> = {};
    if (name !== undefined) updateFields.name = name;
    if (type !== undefined) updateFields.type = type;
    if (isDefault !== undefined) updateFields.isDefault = isDefault;

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(updateFields).length > 0) {
      updateQuery.$set = updateFields;
    }
    // Increment balance instead of replacing it
    if (balance !== undefined) {
      updateQuery.$inc = { balance };
    }

    if (Object.keys(updateQuery).length === 0) {
      const error = createHttpError(400, "At least one field is required to update");
      return next(error);
    }

    const updatedAccount = await accountModel.findByIdAndUpdate(
      accountId,
      updateQuery,
      { new: true },
    );
    if (!updatedAccount) {
      const error = createHttpError(
        500,
        "Something went wrong please try again",
      );
      return next(error);
    }
    res
      .status(200)
      .json(response(true, "Account updated successfully", updatedAccount));
  },
);
