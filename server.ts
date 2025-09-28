import express, { Request, Response } from "express";
const app = express();

const port = process.env.PORT || 8080;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World FROM HARSH");
});
app.get("/api/v1", (req: Request, res: Response) => {
  res.send("This is API ENdpoint");
});
app.listen(port, () => {
  console.log("bingo");
});
