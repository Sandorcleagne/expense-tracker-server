import { Document, Types } from "mongoose";

export interface Account extends Document {
  _id: string;
  name: string;
  type: string;
  balance: number;
  isDefault: boolean;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
