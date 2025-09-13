import app from "../src/app";
import { config } from "../src/config/config";
import { connectDB } from "../src/db/index";
const startServer = () => {
  const port = config.port || 8080;
  connectDB()
    .then(() =>
      app.listen(port, () => {
        console.log(`http://localhost:${port}`);
      })
    )
    .catch((err): any => {
      console.log("Mongodb connection failed", err);
    });
};

startServer();
