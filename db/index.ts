import mongoose from "mongoose";
import { DB_Name } from "../constant.js";
import { config } from "../config/config.js";

export const connectDB = async () => {
  const connectionString =
    "mongodb://harshjoshik2:g3rkdceLQVJOVFdL@ac-6sptosu-shard-00-00.2nlrzzi.mongodb.net:27017,ac-6sptosu-shard-00-01.2nlrzzi.mongodb.net:27017,ac-6sptosu-shard-00-02.2nlrzzi.mongodb.net:27017";
  const connectionParams =
    "ssl=true&replicaSet=atlas-t0q1fm-shard-0&authSource=admin&appName=Cluster0";
  // const connectionString = config?.database_URI;
  try {
    await mongoose.connect(`${connectionString}/${DB_Name}?${connectionParams}`, {
      family: 4,
    });

    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Connection Error:", error);
    process.exit(1);
  }
};
