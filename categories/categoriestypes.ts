import { Document, Types } from "mongoose";

export interface Category extends Document {
  _id: string;
  categoryName: string;
  color: string;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
