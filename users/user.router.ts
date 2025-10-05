import express from "express";
import { getUsers, loginUser, registerUser } from "./user.controller.js";
const userRouter = express.Router();
userRouter.post("/register-user", registerUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/get-users", getUsers);
export default userRouter;
