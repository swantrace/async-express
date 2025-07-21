import { compose } from "../../core/compose";
import { authenticateUser } from "../../auth/middleware";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
  getTask,
  getTasks,
} from "../../services/task.service";
import { createTaskSchema, updateTaskSchema } from "../../db/prisma";
import type { ValidatedMetadata } from "../../core/result";

// Types
type CreateTaskSchemas = {
  body: typeof createTaskSchema;
};

type UpdateTaskSchemas = {
  body: typeof updateTaskSchema;
};

// Pipeline steps
async function prepareTaskCreation(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<CreateTaskSchemas>
) {
  return await createTask(user.userId, metadata.body);
}

async function prepareTaskUpdate(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<UpdateTaskSchemas> & { params: { id: string } }
) {
  return await updateTask(metadata.params.id, user.userId, metadata.body);
}

async function prepareTaskToggle(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<any> & { params: { id: string } }
) {
  return await toggleTaskCompletion(metadata.params.id, user.userId);
}

async function prepareTaskDeletion(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<any> & { params: { id: string } }
) {
  return await deleteTask(metadata.params.id, user.userId);
}

async function prepareTaskGet(
  user: { userId: string; email: string; role: string },
  metadata: ValidatedMetadata<any> & { params: { id: string } }
) {
  return await getTask(metadata.params.id, user.userId);
}

async function prepareTasksList(user: {
  userId: string;
  email: string;
  role: string;
}) {
  return await getTasks(user.userId);
}

// Compose handlers
export const getTasksHandler = compose([authenticateUser, prepareTasksList], {
  enableLogging: true,
});

export const getTaskHandler = compose([authenticateUser, prepareTaskGet], {
  enableLogging: true,
});

export const createTaskHandler = compose(
  [authenticateUser, prepareTaskCreation],
  {
    validationSchemas: {
      body: createTaskSchema,
    },
    enableLogging: true,
  }
);

export const updateTaskHandler = compose(
  [authenticateUser, prepareTaskUpdate],
  {
    validationSchemas: {
      body: updateTaskSchema,
    },
    enableLogging: true,
  }
);

export const toggleTaskHandler = compose(
  [authenticateUser, prepareTaskToggle],
  {
    enableLogging: true,
  }
);

export const deleteTaskHandler = compose(
  [authenticateUser, prepareTaskDeletion],
  {
    enableLogging: true,
  }
);
