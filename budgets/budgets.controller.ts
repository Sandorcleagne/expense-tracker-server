import { Response, NextFunction } from "express";
import { CustomRequest } from "../types.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { budgetModel } from "./budgets.model.js";
import { response } from "../utils/responseTemplate.js";
import createHttpError from "http-errors";

export const createBudget = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { amount, lastAlertSent } = req.body;
    if (!amount) {
      const error = createHttpError(400, "Amount is required");
      return next(error);
    }
    const budget = await budgetModel.create({
      amount,
      lastAlertSent,
      userId: req.user?._id,
    });
    const createdBudget = await budgetModel.findById(budget?._id);
    if (!createdBudget) {
      const error = createHttpError(
        500,
        "Something went wrong please try again",
      );
      return next(error);
    }
    res
      .status(200)
      .json(response(true, "Budget created successfully", createdBudget));
  },
);
