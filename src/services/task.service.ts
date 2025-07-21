import {
  findTasksByUserId,
  findTaskById,
  createTask as createTaskRecord,
  updateTask as updateTaskRecord,
  deleteTask as deleteTaskRecord,
} from "../repositories/task.repository";
import { Ok, NotFound, type Result } from "../core/result";
import type { Task, NewTask } from "../db/schema";

export const getTasksWithStats = async (
  userId: string
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
> => {
  const tasks = await findTasksByUserId(userId);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
    highPriority: tasks.filter((t) => t.priority === "high" && !t.completed)
      .length,
  };

  return Ok({ tasks, stats });
};

export const createTask = async (
  userId: string,
  taskData: Omit<NewTask, "userId" | "id" | "createdAt" | "updatedAt">
): Promise<Result<Task>> => {
  const task = await createTaskRecord({
    ...taskData,
    userId,
  });

  return Ok(task);
};

export const updateTask = async (
  taskId: string,
  userId: string,
  updates: Partial<Task>
): Promise<Result<Task>> => {
  const task = await updateTaskRecord(taskId, userId, updates);

  if (!task) {
    return NotFound("Task not found");
  }

  return Ok(task);
};

export const deleteTask = async (
  taskId: string,
  userId: string
): Promise<Result<{ message: string }>> => {
  const deleted = await deleteTaskRecord(taskId, userId);

  if (!deleted) {
    return NotFound("Task not found");
  }

  return Ok({ message: "Task deleted successfully" });
};

export const toggleTaskCompletion = async (
  taskId: string,
  userId: string
): Promise<Result<Task>> => {
  const existingTask = await findTaskById(taskId, userId);

  if (!existingTask) {
    return NotFound("Task not found");
  }

  const updatedTask = await updateTaskRecord(taskId, userId, {
    completed: !existingTask.completed,
  });

  return Ok(updatedTask!);
};

export const getTask = async (
  taskId: string,
  userId: string
): Promise<Result<Task>> => {
  const task = await findTaskById(taskId, userId);

  if (!task) {
    return NotFound("Task not found");
  }

  return Ok(task);
};

export const getTasks = async (userId: string): Promise<Result<Task[]>> => {
  const tasks = await findTasksByUserId(userId);
  return Ok(tasks);
};

// Pipeline functions for controllers
export async function prepareTaskCreation(
  user: { userId: string; email: string; role: string },
  metadata
) {
  return await createTask(user.userId, metadata.body);
}

export async function prepareTaskUpdate(
  user: { userId: string; email: string; role: string },
  metadata: { body: any; params: { id: string } }
) {
  return await updateTask(metadata.params.id, user.userId, metadata.body);
}

export async function prepareTaskToggle(
  user: { userId: string; email: string; role: string },
  metadata: { params: { id: string } }
) {
  return await toggleTaskCompletion(metadata.params.id, user.userId);
}

export async function prepareTaskDeletion(
  user: { userId: string; email: string; role: string },
  metadata: { params: { id: string } }
) {
  return await deleteTask(metadata.params.id, user.userId);
}

export async function prepareTaskGet(
  user: { userId: string; email: string; role: string },
  metadata: { params: { id: string } }
) {
  return await getTask(metadata.params.id, user.userId);
}

export async function prepareTasksList(user: {
  userId: string;
  email: string;
  role: string;
}) {
  return await getTasks(user.userId);
}

// Web-specific task functions
export async function getTasksData(user: {
  userId: string;
  email: string;
  role: string;
}) {
  return await getTasksWithStats(user.userId);
}
