import express, { Router } from "express";
import {
  renderLogin,
  renderSignup,
} from "../../controllers/web/auth.controller";

const router: Router = express.Router();

// Routes
router.get("/login", renderLogin);
router.get("/signup", renderSignup);

export default router;
