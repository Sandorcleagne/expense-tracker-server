import app from "../src/app";
import { connectDB } from "../src/db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Prevent reconnect spam
let isConnected = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection failed", err);
      return res.status(500).json({ error: "DB connection failed" });
    }
  }

  return app(req, res);
}
