import express, { Request, Response } from "express";
import { connectDB } from "./db/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./users/user.router.js";
import globalErrorHandler from "./middlewares/errorhandler.middleware.js";
import accountRouter from "./accounts/accounts.router.js";
import budgetRouter from "./budgets/budgets.router.js";
import transactionRouter from "./transactions/transaction.router.js";
import analyticsRouter from "./analytics/analytics.router.js";
import categoryRouter from "./categories/categories.router.js";
const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "40kb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));
app.use(express.static("public"));

const port = process.env.PORT || 8080;
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World From HARSH this is the first change after using pm2");
});
app.get("/api/v1", (req: Request, res: Response) => {
  res.send("This is API ENdpoint");
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/budgets", budgetRouter);
app.use("/api/v1/transactions", transactionRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/categories", categoryRouter);
app.use(globalErrorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((err): any => {
    console.error("MongoDB connection failed", err);
  });
