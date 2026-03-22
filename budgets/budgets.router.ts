import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { createBudget } from "./budgets.controller.js";
const budgetRouter = express.Router();
budgetRouter.post("/create-budget", verifyJwt, createBudget);
export default budgetRouter;
