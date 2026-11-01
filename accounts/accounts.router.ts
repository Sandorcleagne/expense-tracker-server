import express from "express";
import {
  createAccount,
  deleteAccount,
  getUserAccounts,
  updateAccount,
} from "./accounts.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const accountRouter = express.Router();
accountRouter.post("/create-account", verifyJwt, createAccount);
accountRouter.get("/get-user-accounts", verifyJwt, getUserAccounts);
accountRouter.patch("/update-account", verifyJwt, updateAccount);
accountRouter.patch("/delete-account/:accountId", verifyJwt, deleteAccount);
export default accountRouter;
