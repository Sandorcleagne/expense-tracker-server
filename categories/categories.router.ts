import express from "express";
import {
  createCategory,
  getUserCategories,
  deleteCategory,
  updateCategory,
} from "./categories.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const categoryRouter = express.Router();
categoryRouter.post("/create-category", verifyJwt, createCategory);
categoryRouter.get("/get-user-categories", verifyJwt, getUserCategories);
categoryRouter.delete("/delete-category/:id", verifyJwt, deleteCategory);
categoryRouter.patch("/update-category/:id", verifyJwt, updateCategory);
export default categoryRouter;
