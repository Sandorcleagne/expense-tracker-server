import express, { Request, Response } from "express";
import { config } from "../src/config/config";
const app = express();
app.use(express.json());
const port = config.port || 8080;

app.get(
  "/v1/",
  // verifyJWT,
  (req: Request, res: Response) => {
    res.json({ message: "This is an API" });
  }
);
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
export default app;
