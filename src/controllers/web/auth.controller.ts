import express, { Request, Response } from "express";
import { compose } from "@/core/compose";
import {
  registerUser,
  generateRegistrationTokenWithCookie,
  loginUser,
  generateLoginTokenWithCookie,
} from "@/services/auth.service";
import {
  renderLoginPage,
  renderSignupPage,
  redirectAfterLogin,
  redirectAfterSignup,
} from "@/services/web.service";
import { signupSchema, loginSchema } from "@/db/schema";

// Page rendering handlers
export const renderLoginHandler = compose([renderLoginPage], {
  enableLogging: true,
});

export const renderSignupHandler = compose([renderSignupPage], {
  enableLogging: true,
});

// Compose handlers for web routes (using cookies and redirects)
export const signupHandler = compose(
  [registerUser, generateRegistrationTokenWithCookie, redirectAfterSignup],
  {
    enableLogging: true,
    validationSchemas: {
      body: signupSchema,
    },
  }
);

export const loginHandler = compose(
  [loginUser, generateLoginTokenWithCookie, redirectAfterLogin],
  {
    enableLogging: true,
    validationSchemas: {
      body: loginSchema,
    },
  }
);

// Logout handler
export const logoutHandler = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
};
