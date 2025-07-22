import { Ok, type Result } from "@/core/result";

// Auth rendering functions
export async function renderLoginPage(): Promise<
  Result<{ view: string; data: any }>
> {
  return Ok({
    view: "auth/login",
    data: {
      title: "Login",
    },
  });
}

export async function renderSignupPage(): Promise<
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
export async function redirectAfterLogin(): Promise<
  Result<{ redirect: string }>
> {
  return Ok({
    redirect: "/tasks",
  });
}

export async function redirectAfterSignup(): Promise<
  Result<{ redirect: string }>
> {
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
