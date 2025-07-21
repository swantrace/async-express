import express, { Router } from "express";
import {
  getProfileHandler,
  updateProfileHandler,
} from "@/controllers/api/user.controller";

const router: Router = express.Router();

// Routes
router.get("/profile", getProfileHandler);
router.put("/profile", updateProfileHandler);

export default router;
