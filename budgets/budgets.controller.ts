import { Response, NextFunction } from "express";
import { CustomRequest } from "../types.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { budgetModel } from "./budgets.model.js";
import { response } from "../utils/responseTemplate.js";
import createHttpError from "http-errors";

export const createBudget = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { amount, lastAlertSent = null, lastAlertLevel = null } = req.body;
    if (!amount) {
      const error = createHttpError(400, "Amount is required");
      return next(error);
    }
    if (!req.body.type) {
      const error = createHttpError(400, "Type is required");
      return next(error);
    }
    const type = req.body.type.toUpperCase();
    if (!["MONTHLY", "YEARLY", "WEEKLY", "DAILY"].includes(type)) {
      const error = createHttpError(400, "Invalid type");
      return next(error);
    }
    const existingBudget = await budgetModel.findOne({
      userId: req.user?._id,
    });
    if (existingBudget) {
      const error = createHttpError(400, "Budget already exists, each user can only have one budget");
      return next(error);
    }
    const budget = await budgetModel.create({
      amount,
      lastAlertSent,
      lastAlertLevel,
      userId: req.user?._id,
      type,
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

export const getBudget = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const budget = await budgetModel.findOne({
      userId: req.user?._id,
    });
    if (!budget) {
      const error = createHttpError(404, "Budget not found");
      return next(error);
    }
    res.status(200).json(response(true, "Budget fetched successfully", budget));
  },
);
