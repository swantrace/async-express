import { z } from "zod";

// Zod schemas for validation
export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Type definitions
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  hashedPassword: string;
};

export type AuthResponse = {
  success: boolean;
  user: UserResponse;
};
