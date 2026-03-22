import { Document } from "mongoose";
export interface Transaction extends Document {
  _id: string;
  type: string;
  userId: string;
  amount: number;
  accountId: string;
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
