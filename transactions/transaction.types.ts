import { Document, Types } from "mongoose";
export interface Transaction extends Document {
  _id: string;
  type: string;
  userId: Types.ObjectId;
  amount: number;
  accountId: Types.ObjectId;
  description: string;
  category: string;
  receiptUrl: string;
  isRecurring: boolean;
  recurringInterval: string;
  nextRecurringDate: Date;
  lastProcessedDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
