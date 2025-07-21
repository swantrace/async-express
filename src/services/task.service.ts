import {
  findTasksByUserId,
  findTaskById,
  createTask as createTaskRecord,
  updateTask as updateTaskRecord,
  deleteTask as deleteTaskRecord,
} from "../repositories/task.repository";
import { Ok, NotFound, type Result } from "../core/result";
import type { Task, NewTask } from "../db/prisma";

export const getDashboardData = async (
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
