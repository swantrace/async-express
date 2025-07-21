import express, { type Router } from "express";
import {
  registerHandler,
  loginHandler,
} from "@/controllers/api/auth.controller";

const router: Router = express.Router();

// Routes
router.post("/register", registerHandler);
router.post("/login", loginHandler);

export default router;
