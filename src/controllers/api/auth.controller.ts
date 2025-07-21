import { compose } from "../../core/compose";
import {
  prepareUserRegistration,
  generateRegistrationToken,
  prepareUserLogin,
  generateLoginToken,
} from "../../services/auth.service";
import { signupSchema, loginSchema } from "../../schemas/auth";

// Compose handlers
export const registerHandler = compose(
  [prepareUserRegistration, generateRegistrationToken],
  {
    validationSchemas: {
      body: signupSchema,
    },
    enableLogging: true,
  }
);

export const loginHandler = compose([prepareUserLogin, generateLoginToken], {
  validationSchemas: {
    body: loginSchema,
  },
  enableLogging: true,
});
