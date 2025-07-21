import express, { Router } from "express";
import {
  getTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  toggleTaskHandler,
  deleteTaskHandler,
} from "../../controllers/api/task.controller";

const router: Router = express.Router();

// Routes
router.get("/", getTasksHandler);
router.post("/", createTaskHandler);
router.get("/:id", getTaskHandler);
router.put("/:id", updateTaskHandler);
router.patch("/:id/toggle", toggleTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;
