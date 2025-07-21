import { registerUser, authenticateUser } from "./user.service";
import { generateToken, verifyToken } from "@/lib/utils";
import {
  Ok,
  Unauthorized,
  type Result,
  type ValidatedMetadata,
} from "@/core/result";
import type { signupSchema, loginSchema } from "@/schemas/auth";

// Types for validation schemas
type RegisterSchemas = {
  body: typeof signupSchema;
};

type LoginSchemas = {
  body: typeof loginSchema;
};

// Auth pipeline functions
export async function prepareUserRegistration(
  _: null,
  metadata: ValidatedMetadata<RegisterSchemas>
): Promise<Result<{ message: string; user: any }>> {
  const { email, name, password } = metadata.body;
  return await registerUser({ email, name, password });
}

export async function generateRegistrationToken(data: {
  message: string;
  user: any;
}) {
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

export async function prepareUserLogin(
  _: null,
  metadata: ValidatedMetadata<LoginSchemas>
): Promise<Result<any>> {
  const { email, password } = metadata.body;
  return await authenticateUser(email, password);
}

export async function generateLoginToken(user: any) {
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
export async function generateRegistrationTokenWithCookie(data: {
  message: string;
  user: any;
}) {
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

export async function generateLoginTokenWithCookie(user: any) {
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
