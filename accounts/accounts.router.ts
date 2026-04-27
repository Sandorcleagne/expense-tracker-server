import express from "express";
import {
  createAccount,
  getUserAccounts,
  updateAccount,
} from "./accounts.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const accountRouter = express.Router();
accountRouter.post("/create-account", verifyJwt, createAccount);
accountRouter.get("/get-user-accounts", verifyJwt, getUserAccounts);
accountRouter.patch("/update-account", verifyJwt, updateAccount);
export default accountRouter;
