import { compose } from "@/core/compose";
import { authenticateApiUser } from "@/services/auth.service";
import { getUserProfile, prepareProfileUpdate } from "@/services/user.service";
import { updateProfileSchema } from "@/db/schema";

// Compose handlers using functional style
export const getProfileHandler = compose(
  [authenticateApiUser, getUserProfile],
  {
    enableLogging: true,
  }
);

export const updateProfileHandler = compose(
  [authenticateApiUser, prepareProfileUpdate],
  {
    validationSchemas: {
      body: updateProfileSchema,
    },
    enableLogging: true,
  }
);
