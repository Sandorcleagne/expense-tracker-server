import express, { Request, Response } from "express";
const app = express();
app.use(express.json());
app.get(
  "/v1/",
  // verifyJWT,
  (req: Request, res: Response) => {
    res.json({ message: "This is an API" });
  }
);
export default app;
