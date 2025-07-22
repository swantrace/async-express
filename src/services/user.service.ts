import {
  findUserById,
  findUserByEmail,
  updateUser,
} from "@/repositories/user.repository";
import { Ok, NotFound, BadRequest, type Result } from "@/core/result";
import type { User, NewUser } from "@/db/schema";

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

export async function updateProfile(
  user: { userId: string; email: string; role: string },
  metadata: { body: any }
) {
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
    user: safeUserData as User,
  });
}
