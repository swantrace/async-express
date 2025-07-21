import express, { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import taskRoutes from "./tasks";

const router: Router = express.Router();

// Mount API routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/tasks", taskRoutes);

export default router;
