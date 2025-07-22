import { compose } from "@/core/compose";
import {
  registerUser,
  generateRegistrationToken,
  loginUser,
  generateLoginToken,
} from "@/services/auth.service";
import { signupSchema, loginSchema } from "@/db/schema";

// Compose handlers
export const registerHandler = compose(
  [registerUser, generateRegistrationToken],
  {
    validationSchemas: {
      body: signupSchema,
    },
    enableLogging: true,
  }
);

export const loginHandler = compose([loginUser, generateLoginToken], {
  validationSchemas: {
    body: loginSchema,
  },
  enableLogging: true,
});
