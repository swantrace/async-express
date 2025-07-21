import express, { Router } from "express";
import { dashboardController } from "../../controllers/web/dashboard.controller";

const router: Router = express.Router();

// Routes
router.get("/", dashboardController);

export default router;
