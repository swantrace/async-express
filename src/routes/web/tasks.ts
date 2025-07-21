import express, { Router } from "express";
import { taskListController } from "@/controllers/web/task.controller";

const router: Router = express.Router();

// Routes
router.get("/", taskListController);

export default router;
