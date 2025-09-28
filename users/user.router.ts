import express from "express";
import { getUsers, registerUser } from "./user.controller.js";
const userRouter = express.Router();
userRouter.post("/register-user", registerUser);
userRouter.get("/get-users", getUsers);
export default userRouter;
