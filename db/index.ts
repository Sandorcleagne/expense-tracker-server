import mongoose from "mongoose";
import { DB_Name } from "../constant.js";
import { config } from "../config/config.js";

export const connectDB = async () => {
  const connectionString = config.database_URI || "";
  const connectionParams = config.connection_params || "";
  try {
    await mongoose.connect(
      `${connectionString}/${DB_Name}?${connectionParams}`,
      {
        family: 4,
      },
    );

    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Connection Error:", error);
    process.exit(1);
  }
};
