import { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asynchandler.js";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../users/user.model.js";
import { CustomRequest } from "../types.js";
export const verifyJwt = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const incomingToken =
        req?.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      if (!incomingToken) {
        const error = createHttpError(401, "Unauthorized Request");
        return next(error);
      }
      const decodedToken = jwt.verify(
        incomingToken,
        config?.ACCESS_TOKEN_SECRETE
      ) as JwtPayload;
      const user = await userModel
        .findById(decodedToken?._id)
        .select("-password -refreshToken");
      if (!user) {
        const error = createHttpError(401, "Invalid access token");
        return next(error);
      }
      req.user = user;
      next();
    } catch (err) {
      const error = createHttpError(400, "Something went wrong.");
      return next(error);
    }
  }
);
