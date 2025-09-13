import { config } from "./config/config";
import { CookieOptions } from "express";

export const DB_Name = "expense_tracker";
export const options: CookieOptions = {
  httpOnly: config?.env === "production" ? true : false,
  secure: config?.env === "production",
  sameSite: "lax",
  path: "/",
};
