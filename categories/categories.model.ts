import mongoose from "mongoose";
import { Category } from "./categoriestypes.js";

const categorySchema = new mongoose.Schema<Category>(
  {
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Category color is required"],
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1 });

export const categoryModel = mongoose.model<Category>(
  "Category",
  categorySchema,
);
