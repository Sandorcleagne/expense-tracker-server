import { Document } from "mongoose";
export interface Budget extends Document {
  _id: string;
  amount: number;
  userId: string;
  lastAlertSent: Date;
  createdAt: Date;
  updatedAt: Date;
}
