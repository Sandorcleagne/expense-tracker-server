import { Document } from "mongoose";

export interface Account extends Document {
  _id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
