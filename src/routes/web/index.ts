import express, { Router } from "express";
import authRoutes from "./auth";
import dashboardRoutes from "./dashboard";

const router: Router = express.Router();

// Mount web routes
router.use("/auth", authRoutes);
router.use("/dashboard", dashboardRoutes);

// Redirect root to dashboard
router.get("/", (req, res) => {
  res.redirect("/dashboard");
});

export default router;
