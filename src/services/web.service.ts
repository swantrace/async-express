import { Ok, type Result, type ValidatedMetadata } from "@/core/result";
import type { Task } from "@/db/schema";

// Template view data types
type ViewData = Record<string, any>;
type ViewResult = { view: string; data: ViewData };
type RedirectResult = { redirect: string };
type TaskListData = {
  tasks: Task[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    highPriority: number;
  };
  title: string;
};

// Auth rendering functions
export async function renderLoginPage(
  _: null,
  metadata: ValidatedMetadata<{}>
): Promise<Result<ViewResult>> {
  return Ok({
    view: "auth/login",
    data: {
      title: "Login",
    },
  });
}

export async function renderSignupPage(
  _: null,
  metadata: ValidatedMetadata<{}>
): Promise<Result<ViewResult>> {
  return Ok({
    view: "auth/signup",
    data: {
      title: "Sign Up",
    },
  });
}

// Web auth redirect functions
export async function redirectAfterLogin(
  data: any,
  metadata: ValidatedMetadata<any>
): Promise<Result<RedirectResult>> {
  return Ok({
    redirect: "/tasks",
  });
}

export async function redirectAfterSignup(
  data: any,
  metadata: ValidatedMetadata<any>
): Promise<Result<RedirectResult>> {
  return Ok({
    redirect: "/tasks",
  });
}

// Task rendering functions
export async function renderTaskList(
  data: {
    tasks: Task[];
    stats: {
      total: number;
      completed: number;
      pending: number;
      highPriority: number;
    };
  },
  metadata: ValidatedMetadata<{}>
): Promise<Result<{ view: string; data: TaskListData }>> {
  return Ok({
    view: "tasks/index",
    data: {
      ...data,
      title: "Your Tasks",
    },
  });
}
