import express, { Router } from "express";
import authRoutes from "./auth";
import taskRoutes from "./tasks";

const router: Router = express.Router();

// Mount web routes
router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);

// Redirect root to tasks
router.get("/", (req, res) => {
  res.redirect("/tasks");
});

export default router;
