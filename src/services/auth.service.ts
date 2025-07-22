import { generateToken, verifyToken } from "@/lib/utils";
import {
  BadRequest,
  Ok,
  Unauthorized,
  type Result,
  type ValidatedMetadata,
} from "@/core/result";
import type {
  signupSchema,
  loginSchema,
  User,
  SignupInput,
  LoginInput,
} from "@/db/schema";
import { createUser, findUserByEmail } from "@/repositories/user.repository";
import { hashPassword, comparePassword } from "@/lib/utils";

// Types for validation schemas
type RegisterSchemas = {
  body: typeof signupSchema;
};

type LoginSchemas = {
  body: typeof loginSchema;
};

// Auth pipeline functions
export async function registerUser(
  _: null,
  metadata: ValidatedMetadata<RegisterSchemas>
): Promise<Result<{ message: string; user: Omit<User, "hashedPassword"> }>> {
  const { email, name, password } = metadata.body;
  // Check if user already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return BadRequest("User already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = await createUser({
    email,
    name,
    hashedPassword,
  });

  // Remove sensitive data
  const { hashedPassword: _hashed, ...safeUserData } = newUser;

  return Ok({
    message: "User registered successfully",
    user: safeUserData,
  });
}

export async function generateRegistrationToken(
  data: { message: string; user: Omit<User, "hashedPassword"> },
  metadata: ValidatedMetadata<RegisterSchemas>
): Promise<
  Result<{ message: string; user: Omit<User, "hashedPassword">; token: string }>
> {
  const token = generateToken({
    userId: data.user.id,
    email: data.user.email,
    role: "user",
  });

  return Ok({
    message: data.message,
    user: data.user,
    token,
  });
}

export async function loginUser(
  _: null,
  metadata: ValidatedMetadata<LoginSchemas>
): Promise<Result<Omit<User, "hashedPassword">>> {
  const { email, password } = metadata.body;
  const user = await findUserByEmail(email);

  if (!user) {
    return BadRequest("Invalid credentials");
  }

  const isValidPassword = await comparePassword(password, user.hashedPassword);

  if (!isValidPassword) {
    return BadRequest("Invalid credentials");
  }

  // Remove sensitive data
  const { hashedPassword, ...safeUserData } = user;
  return Ok(safeUserData);
}

export async function generateLoginToken(
  user: Omit<User, "hashedPassword">,
  metadata: ValidatedMetadata<LoginSchemas>
): Promise<
  Result<{ message: string; user: Omit<User, "hashedPassword">; token: string }>
> {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: "user",
  });

  return Ok({
    message: "Login successful",
    user,
    token,
  });
}

// Cookie-based auth functions for web routes
export async function generateRegistrationTokenWithCookie(
  data: { message: string; user: Omit<User, "hashedPassword"> },
  metadata: ValidatedMetadata<RegisterSchemas>
): Promise<Result<{ success: true; user: Omit<User, "hashedPassword"> }>> {
  const token = generateToken({
    userId: data.user.id,
    email: data.user.email,
    role: "user",
  });

  return Ok(
    {
      success: true,
      user: data.user,
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

export async function generateLoginTokenWithCookie(
  user: Omit<User, "hashedPassword">,
  metadata: ValidatedMetadata<LoginSchemas>
): Promise<Result<{ success: true; user: Omit<User, "hashedPassword"> }>> {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: "user",
  });

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

// Authentication pipeline functions
export async function authenticateApiUser(
  _: null,
  metadata: ValidatedMetadata<any>
): Promise<Result<{ userId: string; email: string; role: string }>> {
  const { cookies, headers } = metadata;
  const token = cookies?.token || headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return Unauthorized("No token provided");
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return Unauthorized("Invalid token");
  }

  return Ok(decoded);
}

export async function authenticateWebUser(
  _: null,
  metadata: ValidatedMetadata<any>
): Promise<Result<{ userId: string; email: string; role: string }>> {
  const { cookies } = metadata;
  const token = cookies?.token;

  if (!token) {
    return Unauthorized("No token provided");
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return Unauthorized("Invalid token");
  }

  return Ok(decoded);
}
