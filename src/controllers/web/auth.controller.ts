import { Ok } from "../../core/result";

export async function renderLogin() {
  return Ok({
    view: "auth/login",
    data: {
      title: "Login",
    },
  });
}

export async function renderSignup() {
  return Ok({
    view: "auth/signup",
    data: {
      title: "Sign Up",
    },
  });
}
