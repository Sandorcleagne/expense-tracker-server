import express from "express";
import { createAccount } from "./accounts.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const accountRouter = express.Router();
accountRouter.post("/create-account", verifyJwt, createAccount);
export default accountRouter;
