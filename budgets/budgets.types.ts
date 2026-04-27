import { Document, Types } from "mongoose";
export interface Budget extends Document {
  _id: string;
  amount: number;
  spent: number;
  type: string;
  userId: Types.ObjectId;
  lastAlertSent: Date;
  lastAlertLevel: number | null;
  createdAt: Date;
  updatedAt: Date;
}
