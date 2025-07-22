import {
  findTasksByUserId,
  findTaskById,
  createTask as createTaskRecord,
  updateTask as updateTaskRecord,
  deleteTask as deleteTaskRecord,
} from "@/repositories/task.repository";
import { Ok, NotFound, type Result } from "@/core/result";
import type { Task, NewTask } from "@/db/schema";

export async function createTask(
  user: { userId: string; email: string; role: string },
  metadata
) {
  const task = await createTaskRecord({
    ...metadata.body,
    userId: user.userId,
  });

  return Ok(task);
}

export async function updateTask(
  user: { userId: string; email: string; role: string },
  metadata: { body: any; params: { id: string } }
) {
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
  user: { userId: string; email: string; role: string },
  metadata: { params: { id: string } }
) {
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
  user: { userId: string; email: string; role: string },
  metadata: { params: { id: string } }
) {
  const deleted = await deleteTaskRecord(metadata.params.id, user.userId);

  if (!deleted) {
    return NotFound("Task not found");
  }

  return Ok({ message: "Task deleted successfully" });
}

export async function getTask(
  user: { userId: string; email: string; role: string },
  metadata: { params: { id: string } }
) {
  const task = await findTaskById(metadata.params.id, user.userId);

  if (!task) {
    return NotFound("Task not found");
  }

  return Ok(task);
}

export async function listTasks(user: {
  userId: string;
  email: string;
  role: string;
}) {
  const tasks = await findTasksByUserId(user.userId);
  return Ok(tasks);
}

// Web-specific task functions
export async function getTasksData(user: {
  userId: string;
  email: string;
  role: string;
}) {
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
