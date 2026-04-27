import express from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  createTransaction,
  getAllTransactions,
} from "./transaction.controller.js";
const transactionRouter = express.Router();
transactionRouter.post("/create-transaction", verifyJwt, createTransaction);
transactionRouter.get("/get-all-transactions", verifyJwt, getAllTransactions);
export default transactionRouter;
