import { compose } from "../../core/compose";
import { authenticateUser } from "../../auth/middleware";
import { getUserProfile, updateProfile } from "../../services/user.service";
import { updateProfileSchema } from "../../db/prisma";
import type { ValidatedMetadata } from "../../core/result";

// Types
type UpdateProfileSchemas = {
  body: typeof updateProfileSchema;
};

// Pipeline steps
async function prepareProfileUpdate(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<UpdateProfileSchemas>
) {
  return await updateProfile(user.userId, metadata.body);
}

// Compose handlers using functional style
export const getProfileHandler = compose([authenticateUser, getUserProfile], {
  enableLogging: true,
});

export const updateProfileHandler = compose(
  [authenticateUser, prepareProfileUpdate],
  {
    validationSchemas: {
      body: updateProfileSchema,
    },
    enableLogging: true,
  }
);
