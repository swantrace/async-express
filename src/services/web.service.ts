import { title } from "process";
import { Ok, type Result } from "../core/result";

// Auth rendering functions
export async function prepareLoginPage(): Promise<
  Result<{ view: string; data: any }>
> {
  return Ok({
    view: "auth/login",
    data: {
      title: "Login",
    },
  });
}

export async function prepareSignupPage(): Promise<
  Result<{ view: string; data: any }>
> {
  return Ok({
    view: "auth/signup",
    data: {
      title: "Sign Up",
    },
  });
}

// Web auth redirect functions
export async function redirectAfterLogin(
  data: any
): Promise<Result<{ redirect: string }>> {
  return Ok({
    redirect: "/tasks",
  });
}

export async function redirectAfterSignup(
  data: any
): Promise<Result<{ redirect: string }>> {
  return Ok({
    redirect: "/tasks",
  });
}

// Task rendering functions
export async function renderTaskList(
  data: any
): Promise<Result<{ view: string; data: any }>> {
  return Ok({
    view: "tasks/index",
    data: {
      ...data,
      title: "Your Tasks",
    },
  });
}
