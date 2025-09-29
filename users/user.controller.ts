import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { emailRegex } from "../utils/regex.js";
import userModel from "./user.model.js";
import { response } from "../utils/responseTemplate.js";
import { asyncHandler } from "../utils/asynchandler.js";
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
  res
    .status(201)
    .json(response(true, "User registerd successfully", createdUser));
};
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
});
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email } = req.query;
  let users;
  if (fullName || email) {
    const query: any = {};
    if (fullName || email) {
      query.$or = [];
      if (fullName) {
        query.$or.push({ fullName: { $regex: fullName, $options: "i" } });
      }
      if (email) {
        query.$or.push({ email: { $regex: email, $options: "i" } });
      }
    }

    users = await userModel.find(query);

    if (!users || users.length === 0) {
      return res.status(200).json(response(false, "No users found", []));
    }
    res.status(201).json(response(true, "User Found Successfully", users));
  } else {
    users = await userModel.find({}).select("-password -refreshToken");
    return res
      .status(200)
      .json(response(true, "All users fetched successfully", users));
  }
});
