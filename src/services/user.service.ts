import {
  findUserById,
  findUserByEmail,
  createUser as createUserRecord,
  updateUser as updateUserRecord,
} from "../repositories/user.repository";
import { Ok, NotFound, BadRequest, type Result } from "../core/result";
import type { User, NewUser } from "../db/prisma";
import { hashPassword, comparePassword } from "../auth/password";

export const getUserProfile = async (user: {
  userId: string;
}): Promise<Result<{ message: string; user: User }>> => {
  const userData = await findUserById(user.userId);

  if (!userData) {
    return NotFound("User not found");
  }

  // Remove sensitive data
  const { hashedPassword, ...safeUserData } = userData;

  return Ok({
    message: "Profile retrieved successfully",
    user: safeUserData as User,
  });
};

export const updateProfile = async (
  userId: string,
  updates: Partial<Pick<User, "name" | "email">>
): Promise<Result<{ message: string; user: User }>> => {
  const existingUser = await findUserById(userId);

  if (!existingUser) {
    return NotFound("User not found");
  }

  // Check if email is being updated and if it's already taken
  if (updates.email && updates.email !== existingUser.email) {
    const emailExists = await findUserByEmail(updates.email);
    if (emailExists) {
      return BadRequest("Email already in use");
    }
  }

  const updatedUser = await updateUserRecord(userId, updates);

  if (!updatedUser) {
    return NotFound("User not found");
  }

  // Remove sensitive data
  const { hashedPassword, ...safeUserData } = updatedUser;

  return Ok({
    message: "Profile updated successfully",
    user: safeUserData as User,
  });
};

export const registerUser = async (userData: {
  email: string;
  name: string;
  password: string;
}): Promise<Result<{ message: string; user: User }>> => {
  // Check if user already exists
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    return BadRequest("User already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const newUser = await createUserRecord({
    email: userData.email,
    name: userData.name,
    hashedPassword,
  });

  // Remove sensitive data
  const { hashedPassword: _, ...safeUserData } = newUser;

  return Ok({
    message: "User registered successfully",
    user: safeUserData as User,
  });
};

export const authenticateUser = async (
  email: string,
  password: string
): Promise<Result<User>> => {
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
  return Ok(safeUserData as User);
};
