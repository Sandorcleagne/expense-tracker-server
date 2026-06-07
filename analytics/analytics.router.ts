import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getDashboardSummary } from "./analytics.controller.js";

const analyticsRouter = Router();

analyticsRouter.use(verifyJwt); // use it once here
analyticsRouter.get("/dashboard", getDashboardSummary);

export default analyticsRouter;
