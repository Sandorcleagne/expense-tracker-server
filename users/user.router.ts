import express from "express";
import {
  getUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "./user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
const userRouter = express.Router();
userRouter.post("/register-user", registerUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/get-users", verifyJwt, getUsers);
userRouter.post("/logout-user", verifyJwt, logoutUser);
userRouter.post("/refresh-access-token", refreshAccessToken);
export default userRouter;
