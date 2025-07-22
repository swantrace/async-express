import {
  findTasksByUserId,
  findTaskById,
  createTask as createTaskRecord,
  updateTask as updateTaskRecord,
  deleteTask as deleteTaskRecord,
} from "@/repositories/task.repository";
import {
  Ok,
  NotFound,
  type Result,
  type ValidatedMetadata,
} from "@/core/result";
import type {
  Task,
  NewTask,
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
} from "@/db/schema";

// Types for validation schemas
type CreateTaskSchemas = {
  body: typeof createTaskSchema;
};

type UpdateTaskSchemas = {
  body: typeof updateTaskSchema;
  params: typeof taskParamsSchema;
};

type TaskParamsSchemas = {
  params: typeof taskParamsSchema;
};

// Authenticated user type
type AuthenticatedUser = {
  userId: string;
  email: string;
  role: string;
};

export async function createTask(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<CreateTaskSchemas>
): Promise<Result<Task>> {
  const task = await createTaskRecord({
    ...metadata.body,
    userId: user.userId,
  });

  return Ok(task);
}

export async function updateTask(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<UpdateTaskSchemas>
): Promise<Result<Task>> {
  const task = await updateTaskRecord(
    metadata.params.id,
    user.userId,
    metadata.body
  );

  if (!task) {
    return NotFound("Task not found");
  }

  return Ok(task);
}

export async function toggleTask(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<TaskParamsSchemas>
): Promise<Result<Task>> {
  const existingTask = await findTaskById(metadata.params.id, user.userId);

  if (!existingTask) {
    return NotFound("Task not found");
  }

  const updatedTask = await updateTaskRecord(metadata.params.id, user.userId, {
    completed: !existingTask.completed,
  });

  return Ok(updatedTask!);
}

export async function deleteTask(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<TaskParamsSchemas>
): Promise<Result<{ message: string }>> {
  const deleted = await deleteTaskRecord(metadata.params.id, user.userId);

  if (!deleted) {
    return NotFound("Task not found");
  }

  return Ok({ message: "Task deleted successfully" });
}

export async function getTask(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<TaskParamsSchemas>
): Promise<Result<Task>> {
  const task = await findTaskById(metadata.params.id, user.userId);

  if (!task) {
    return NotFound("Task not found");
  }

  return Ok(task);
}

export async function listTasks(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<{}>
): Promise<Result<Task[]>> {
  const tasks = await findTasksByUserId(user.userId);
  return Ok(tasks);
}

// Web-specific task functions
export async function getTasksData(
  user: AuthenticatedUser,
  metadata: ValidatedMetadata<{}>
): Promise<
  Result<{
    tasks: Task[];
    stats: {
      total: number;
      completed: number;
      pending: number;
      highPriority: number;
    };
  }>
> {
  const tasks = await findTasksByUserId(user.userId);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "high" && !t.completed)
      .length,
  };

  return Ok({ tasks, stats });
}
