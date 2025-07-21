import express, { Router } from "express";
import { verifyToken } from "../auth/jwt.js";
import { compose } from "../core/compose.js";
import {
  Ok,
  Unauthorized,
  type Result,
  type ValidatedMetadata,
} from "../core/result.js";
import { z } from "zod";

const router: Router = express.Router();

// Schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});

// Types
type UpdateProfileSchemas = {
  body: typeof updateProfileSchema;
};

interface AuthenticatedMetadata
  extends ValidatedMetadata<UpdateProfileSchemas> {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

// Authentication pipeline step
async function authenticateUser(
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

// Get profile pipeline step
async function getUserProfile(user: {
  userId: string;
  email: string;
  role: string;
}): Promise<Result<{ message: string; user: any }>> {
  // In a real app, you would fetch user data from database
  return Ok({
    message: "This is a protected route",
    user,
  });
}

// Update profile pipeline steps
async function prepareProfileUpdate(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<UpdateProfileSchemas>
): Promise<Result<{ user: any; updates: any }>> {
  const updates = metadata.body;

  console.log(`Updating profile for user ${user.userId}:`, updates);

  return Ok({
    user,
    updates,
  });
}

async function updateUserProfile(data: {
  user: any;
  updates: any;
}): Promise<Result<{ message: string; user: any }>> {
  const { user, updates } = data;

  // In a real app, you would update the user in the database
  const updatedUser = {
    ...user,
    ...updates,
  };

  return Ok({
    message: "Profile updated successfully",
    user: updatedUser,
  });
}

// Compose handlers using functional style
const getProfileHandler = compose([authenticateUser, getUserProfile], {
  enableLogging: true,
});

const updateProfileHandler = compose(
  [authenticateUser, prepareProfileUpdate, updateUserProfile],
  {
    validationSchemas: {
      body: updateProfileSchema,
    },
    enableLogging: true,
  }
);

// Routes
router.get("/profile", getProfileHandler);
router.put("/profile", updateProfileHandler);

export default router;
