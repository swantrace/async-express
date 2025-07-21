import { compose } from "@/core/compose";
import { authenticateApiUser } from "@/services/auth.service";
import {
  prepareTaskCreation,
  prepareTaskUpdate,
  prepareTaskToggle,
  prepareTaskDeletion,
  prepareTaskGet,
  prepareTasksList,
} from "@/services/task.service";
import { createTaskSchema, updateTaskSchema } from "@/db/schema";

// Compose handlers
export const getTasksHandler = compose(
  [authenticateApiUser, prepareTasksList],
  {
    enableLogging: true,
  }
);

export const getTaskHandler = compose([authenticateApiUser, prepareTaskGet], {
  enableLogging: true,
});

export const createTaskHandler = compose(
  [authenticateApiUser, prepareTaskCreation],
  {
    validationSchemas: {
      body: createTaskSchema,
    },
    enableLogging: true,
  }
);

export const updateTaskHandler = compose(
  [authenticateApiUser, prepareTaskUpdate],
  {
    validationSchemas: {
      body: updateTaskSchema,
    },
    enableLogging: true,
  }
);

export const toggleTaskHandler = compose(
  [authenticateApiUser, prepareTaskToggle],
  {
    enableLogging: true,
  }
);

export const deleteTaskHandler = compose(
  [authenticateApiUser, prepareTaskDeletion],
  {
    enableLogging: true,
  }
);
