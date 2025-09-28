import { Document } from "mongoose";

export interface User extends Document {
  _id: string;
  fullName: string;
  email: string;
  password: string;
  provider: string;
  googleId: string;
  avatar: string;
  isVerified: boolean;
  isActive: boolean;
  refreshToken: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccesstoken(): Promise<string>;
  generateRefreshToken(): Promise<string>;
}
