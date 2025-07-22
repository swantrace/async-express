import { compose } from "@/core/compose";
import { authenticateApiUser } from "@/services/auth.service";
import { getUserProfile, updateProfile } from "@/services/user.service";
import { updateProfileSchema } from "@/db/schema";

// Compose handlers using functional style
export const getProfileHandler = compose(
  [authenticateApiUser, getUserProfile],
  {
    enableLogging: true,
  }
);

export const updateProfileHandler = compose(
  [authenticateApiUser, updateProfile],
  {
    validationSchemas: {
      body: updateProfileSchema,
    },
    enableLogging: true,
  }
);
