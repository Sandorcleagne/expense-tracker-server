import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createBudget, getBudget } from "./budgets.controller.js";
const budgetRouter = express.Router();
budgetRouter.post("/create-budget", verifyJwt, createBudget);
budgetRouter.get("/get-budget", verifyJwt, getBudget);
export default budgetRouter;
