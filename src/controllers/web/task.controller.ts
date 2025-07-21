import { compose } from "@/core/compose";
import { authenticateWebUser } from "@/services/auth.service";
import { getTasksData } from "@/services/task.service";
import { renderTaskList } from "@/services/web.service";

export const taskListController = compose(
  [authenticateWebUser, getTasksData, renderTaskList],
  { enableLogging: true }
);
