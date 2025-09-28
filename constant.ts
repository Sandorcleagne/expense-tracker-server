import { config } from "./config/config.js";
import { CookieOptions } from "express";

export const DB_Name = "expense-tracker";
export const options: CookieOptions = {
  httpOnly: config?.env === "production" ? true : false,
  secure: config?.env === "production",
  sameSite: "lax",
  path: "/",
};
