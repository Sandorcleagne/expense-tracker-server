import express, { Request, Response } from "express";
import { connectDB } from "./db/index.js";
const app = express();

const port = process.env.PORT || 8080;
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World From HARSH");
});
app.get("/api/v1", (req: Request, res: Response) => {
  res.send("This is API ENdpoint");
});
connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err): any => {
    console.error("MongoDB connection failed", err);
  });
