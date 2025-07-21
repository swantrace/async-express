import express, { Router } from "express";
import {
  renderLoginHandler,
  renderSignupHandler,
  signupHandler,
  loginHandler,
  logoutHandler,
} from "@/controllers/web/auth.controller";

const router: Router = express.Router();

// Routes
router.get("/login", renderLoginHandler);
router.get("/signup", renderSignupHandler);
router.post("/signup", signupHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);

export default router;
