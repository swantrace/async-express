import {
  findUserById,
  findUserByEmail,
  updateUser,
} from "@/repositories/user.repository";
import {
  Ok,
  NotFound,
  BadRequest,
  type Result,
  type ValidatedMetadata,
} from "@/core/result";
import type { User, NewUser, updateProfileSchema } from "@/db/schema";

// Types for validation schemas
type UpdateProfileSchemas = {
  body: typeof updateProfileSchema;
};

// Authenticated user type
type AuthenticatedUser = {
  userId: string;
  email: string;
  role: string;
};

export const getUserProfile = async (
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<{}>
): Promise<Result<{ message: string; user: Omit<User, "hashedPassword"> }>> => {
  const userData = await findUserById(user.userId);

  if (!userData) {
    return NotFound("User not found");
  }

  // Remove sensitive data
  const { hashedPassword, ...safeUserData } = userData;

  return Ok({
    message: "Profile retrieved successfully",
    user: safeUserData,
  });
};

export async function updateProfile(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<UpdateProfileSchemas>
): Promise<Result<{ message: string; user: Omit<User, "hashedPassword"> }>> {
  const { userId } = user;
  const updates = metadata.body;
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

  const updatedUser = await updateUser(userId, updates);

  if (!updatedUser) {
    return NotFound("User not found");
  }

  // Remove sensitive data
  const { hashedPassword, ...safeUserData } = updatedUser;

  return Ok({
    message: "Profile updated successfully",
    user: safeUserData,
  });
}
