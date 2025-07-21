import { compose } from "../../core/compose";
import { authenticateWebUser } from "../../auth/middleware";
import { getDashboardData as getTaskData } from "../../services/task.service";
import { Ok } from "../../core/result";

async function getDashboardData(user: {
  userId: string;
  email: string;
  role: string;
}) {
  return await getTaskData(user.userId);
}

async function renderDashboard(data: any) {
  return Ok({
    view: "dashboard/index",
    data: {
      ...data,
      user: { email: data.tasks ? undefined : data.email }, // Add user info if not already present
    },
  });
}

export const dashboardController = compose(
  [authenticateWebUser, getDashboardData, renderDashboard],
  { enableLogging: true }
);
