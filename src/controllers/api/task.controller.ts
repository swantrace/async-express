import { compose } from "@/core/compose";
import { authenticateApiUser } from "@/services/auth.service";
import {
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getTask,
  listTasks,
} from "@/services/task.service";
import {
  createTaskSchema,
  updateTaskSchema,
  taskParamsSchema,
} from "@/db/schema";

// Compose handlers
export const getTasksHandler = compose([authenticateApiUser, listTasks], {
  enableLogging: true,
});

export const getTaskHandler = compose([authenticateApiUser, getTask], {
  validationSchemas: {
    params: taskParamsSchema,
  },
  enableLogging: true,
});

export const createTaskHandler = compose([authenticateApiUser, createTask], {
  validationSchemas: {
    body: createTaskSchema,
  },
  enableLogging: true,
});

export const updateTaskHandler = compose([authenticateApiUser, updateTask], {
  validationSchemas: {
    body: updateTaskSchema,
    params: taskParamsSchema,
  },
  enableLogging: true,
});

export const toggleTaskHandler = compose([authenticateApiUser, toggleTask], {
  validationSchemas: {
    params: taskParamsSchema,
  },
  enableLogging: true,
});

export const deleteTaskHandler = compose([authenticateApiUser, deleteTask], {
  validationSchemas: {
    params: taskParamsSchema,
  },
  enableLogging: true,
});
