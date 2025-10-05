import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { emailRegex } from "../utils/regex.js";
import userModel from "./user.model.js";
import { response } from "../utils/responseTemplate.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { options } from "../constant.js";
const generateAccessAndRefreshToken = async (
  userId: string,
  next: NextFunction
) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = await user?.generateAccesstoken();
    const refreshToken = await user?.generateRefreshToken();
    if (user) {
      user["refreshToken"] = refreshToken || "";
    }
    await user?.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (err) {
    const error = createHttpError(
      500,
      "Something went wrong while generating token"
    );
    return next(error);
  }
};
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
export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!(email || password)) {
      const error = createHttpError(400, "Email and password is required");
      return next(error);
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      const error = createHttpError(400, "User does not exist");
      return next(error);
    }
    if (!user.isActive) {
      const error = createHttpError(400, "User is not active");
      return next(error);
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      const error = createHttpError(400, "Invalid Credentials");
      return next(error);
    }
    const token = await generateAccessAndRefreshToken(user?._id, next);
    if (token) {
      const { accessToken, refreshToken } = token;
      const loggedinUser = await userModel
        .findById(user?._id)
        .select("-password -refreshToken");
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken)
        .json(
          response(true, "User logged in successfully", {
            userDetails: loggedinUser,
            accessToken,
            refreshToken,
          })
        );
    } else {
      const error = createHttpError(400, "Something went wrong.");
      return next(error);
    }
  }
);
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
