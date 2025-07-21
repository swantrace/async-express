import express, { Request, Response, Router } from "express";
import { prisma } from "../db/prisma.js";
import { hashPassword, comparePassword } from "./password.js";
import { generateToken } from "./jwt.js";
import {
  signupSchema,
  loginSchema,
  type SignupInput,
  type UserResponse,
  type AuthResponse,
  type AuthUser,
} from "../schemas/auth.js";
import {
  Ok,
  BadRequest,
  Unauthorized,
  type Result,
  type ValidatedMetadata,
} from "../core/result.js";
import { compose } from "../core/compose.js";

const router: Router = express.Router();

// Type definitions for validation schemas
type SignupValidationSchemas = {
  body: typeof signupSchema;
};

type LoginValidationSchemas = {
  body: typeof loginSchema;
};

// Pipeline steps for signup
async function checkUserExists(
  _: null,
  metadata: ValidatedMetadata<SignupValidationSchemas>
): Promise<Result<SignupInput>> {
  const data = metadata.body; // TypeScript now knows this is SignupInput

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return BadRequest("User already exists");
  }

  return Ok(data);
}

async function createUser(data: SignupInput): Promise<Result<UserResponse>> {
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      hashedPassword,
      name: data.name,
    },
  });

  return Ok({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}

async function generateAuthToken(
  user: UserResponse
): Promise<Result<AuthResponse>> {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Set cookie using metadata approach
  return Ok(
    {
      success: true,
      user,
    },
    {
      cookie_token: {
        value: token,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
      },
    }
  );
}

// Pipeline steps for login
async function findUser(
  _: null,
  metadata: ValidatedMetadata<LoginValidationSchemas>
): Promise<Result<{ user: AuthUser; password: string }>> {
  const { email, password } = metadata.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.hashedPassword) {
    return Unauthorized("Invalid credentials");
  }

  return Ok({ user, password });
}

async function verifyPassword(data: {
  user: AuthUser;
  password: string;
}): Promise<Result<UserResponse>> {
  const {
    user: { id, email, name, role, hashedPassword },
    password,
  } = data;
  const isPasswordValid = await comparePassword(password, hashedPassword);

  if (!isPasswordValid) {
    return Unauthorized("Invalid credentials");
  }

  return Ok({
    id,
    email,
    name,
    role,
  });
}

// Sign up route
const signupHandler = compose(
  [checkUserExists, createUser, generateAuthToken],
  {
    enableLogging: true,
    validationSchemas: {
      body: signupSchema,
    },
  }
);

router.post("/signup", signupHandler);

// Login route
const loginHandler = compose([findUser, verifyPassword, generateAuthToken], {
  enableLogging: true,
  validationSchemas: {
    body: loginSchema,
  },
});

router.post("/login", loginHandler);

// Logout route
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true });
});

export default router;
