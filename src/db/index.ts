import mongoose from "mongoose";
import { DB_Name } from "../constant";
import { config } from "../config/config";
export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${config?.database_URI}/${DB_Name}`
    );
    console.log(`Database Connected ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("Connection Error", error);
    process.exit(1);
  }
};
