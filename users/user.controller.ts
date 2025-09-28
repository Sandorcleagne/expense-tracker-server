import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { emailRegex } from "../utils/regex.js";
import userModel from "./user.model.js";
import { response } from "../utils/responseTemplate.js";
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { fullName = "", email = "", password = "", provider = "" } = req.body;
  if (
    [fullName, email, password, provider].some((field) => field?.trim() === "")
  ) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  if (!fullName || !password || !email || !provider) {
    const error = createHttpError(400, "All Feilds are required");
    return next(error);
  }
  if (!emailRegex.test(email)) {
    const error = createHttpError(400, "Please enter valid email");
    return next(error);
  }
  const userEmail = await userModel.findOne({ email: email });
  if (userEmail) {
    const error = createHttpError(
      400,
      "Email already exist please try different email"
    );
    return next(error);
  }
  const user = await userModel.create({
    fullName,
    email,
    password,
  });
  const createdUser = await userModel
    .findById(user?.id)
    .select("-password -refreshtoken");
  if (!createdUser) {
    const error = createHttpError(500, "Something went wrong please try again");
    return next(error);
  }
  res.status(201).json(response("User registerd successfully", createdUser));
};
