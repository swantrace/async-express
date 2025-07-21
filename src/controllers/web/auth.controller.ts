import express, { Request, Response } from "express";
import { compose } from "@/core/compose";
import {
  prepareUserRegistration,
  generateRegistrationTokenWithCookie,
  prepareUserLogin,
  generateLoginTokenWithCookie,
} from "@/services/auth.service";
import {
  prepareLoginPage,
  prepareSignupPage,
  redirectAfterLogin,
  redirectAfterSignup,
} from "@/services/web.service";
import { signupSchema, loginSchema } from "@/db/schema";

// Page rendering handlers
export const renderLoginHandler = compose([prepareLoginPage], {
  enableLogging: true,
});

export const renderSignupHandler = compose([prepareSignupPage], {
  enableLogging: true,
});

// Compose handlers for web routes (using cookies and redirects)
export const signupHandler = compose(
  [
    prepareUserRegistration,
    generateRegistrationTokenWithCookie,
    redirectAfterSignup,
  ],
  {
    enableLogging: true,
    validationSchemas: {
      body: signupSchema,
    },
  }
);

export const loginHandler = compose(
  [prepareUserLogin, generateLoginTokenWithCookie, redirectAfterLogin],
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
