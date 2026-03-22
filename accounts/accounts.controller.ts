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
