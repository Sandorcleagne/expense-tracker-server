import { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import { CustomRequest } from "../types.js";
import { response } from "../utils/responseTemplate.js";
import { categoryModel } from "./categories.model.js";
import createHttpError from "http-errors";
const CATEGORY_LIMIT = 10;
export const createCategory = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { categoryName, color } = req.body;
    if (!categoryName || !color) {
      return next(createHttpError(400, "Category name and color are required"));
    }
    if (categoryName.trim() === "" || color.trim() === "") {
      return next(
        createHttpError(400, "Category name and color cannot be empty"),
      );
    }
    const categoryCount = await categoryModel.countDocuments({
      userId: req.user._id,
    });
    if (categoryCount >= CATEGORY_LIMIT) {
      return next(
        createHttpError(
          400,
          `You can only have up to ${CATEGORY_LIMIT} categories. Please delete one before creating a new one.`,
        ),
      );
    }
    const existingCategory = await categoryModel.findOne({
      userId: req.user._id,
      categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
    });
    if (existingCategory) {
      return next(createHttpError(400, "Category already exists"));
    }
    const category = await categoryModel.create({
      categoryName: categoryName.trim(),
      color: color.trim(),
      userId: req.user._id,
    });
    const createdCategory = await categoryModel.findById(category?._id);
    if (!createdCategory) {
      return next(
        createHttpError(500, "Something went wrong please try again"),
      );
    }
    return res
      .status(200)
      .json(response(true, "Category created successfully", createdCategory));
  },
);

export const getUserCategories = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const categories = await categoryModel
      .find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json(
      response(true, "Categories fetched successfully", {
        categories,
        count: categories.length,
        remaining: CATEGORY_LIMIT - categories.length,
      }),
    );
  },
);
export const deleteCategory = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const category = await categoryModel.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    // WHY ownership check: prevent user A from deleting user B's category
    if (!category.userId.equals(req.user._id)) {
      return next(createHttpError(403, "Unauthorized"));
    }

    await categoryModel.findByIdAndDelete(id);

    res.status(200).json(response(true, "Category deleted successfully", {}));
  },
);
export const updateCategory = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { categoryName, color } = req.body;

    const category = await categoryModel.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found"));
    }

    if (!category.userId.equals(req.user._id)) {
      return next(createHttpError(403, "Unauthorized"));
    }

    // If renaming, check the new name isn't a duplicate
    if (categoryName && categoryName.trim() !== category.categoryName) {
      const duplicate = await categoryModel.findOne({
        userId: req.user._id,
        categoryName: { $regex: new RegExp(`^${categoryName.trim()}$`, "i") },
        _id: { $ne: id }, // exclude the current category itself
      });
      if (duplicate) {
        return next(createHttpError(400, "Category name already exists"));
      }
    }

    const updated = await categoryModel.findByIdAndUpdate(
      id,
      {
        ...(categoryName && { categoryName: categoryName.trim() }),
        ...(color && { color: color.trim() }),
      },
      { new: true }, // return the updated document
    );

    res
      .status(200)
      .json(response(true, "Category updated successfully", updated));
  },
);
