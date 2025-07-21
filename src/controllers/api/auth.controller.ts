import { compose } from "../../core/compose";
import { registerUser, authenticateUser } from "../../services/user.service";
import { registerSchema, loginSchema } from "../../db/prisma";
import { generateToken } from "../../auth/jwt";
import { hashPassword } from "../../auth/password";
import { Ok, type Result, type ValidatedMetadata } from "../../core/result";

// Types
type RegisterSchemas = {
  body: typeof registerSchema;
};

type LoginSchemas = {
  body: typeof loginSchema;
};

// Pipeline steps
async function prepareUserRegistration(
  _: null,
  metadata: ValidatedMetadata<RegisterSchemas>
) {
  const { email, name, password } = metadata.body;
  return await registerUser({ email, name, password });
}

async function generateRegistrationToken(data: { message: string; user: any }) {
  const token = generateToken({
    userId: data.user.id,
    email: data.user.email,
    role: "user",
  });

  return Ok({
    message: data.message,
    user: data.user,
    token,
  });
}

async function prepareUserLogin(
  _: null,
  metadata: ValidatedMetadata<LoginSchemas>
) {
  const { email, password } = metadata.body;
  return await authenticateUser(email, password);
}

async function generateLoginToken(user: any) {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: "user",
  });

  return Ok({
    message: "Login successful",
    user,
    token,
  });
}

// Compose handlers
export const registerHandler = compose(
  [prepareUserRegistration, generateRegistrationToken],
  {
    validationSchemas: {
      body: registerSchema,
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
