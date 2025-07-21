import { db } from "../db/client";
import { tasks, type Task, type NewTask } from "../db/prisma";
import { eq, and } from "drizzle-orm";

export const findTasksByUserId = async (userId: string): Promise<Task[]> => {
  return await db.select().from(tasks).where(eq(tasks.userId, userId));
};

export const findTaskById = async (
  id: string,
  userId: string
): Promise<Task | null> => {
  const result = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .limit(1);

  return result[0] || null;
};

export const createTask = async (
  taskData: Omit<NewTask, "id" | "createdAt" | "updatedAt">
): Promise<Task> => {
  const [task] = await db.insert(tasks).values(taskData).returning();
  return task!;
};

export const updateTask = async (
  id: string,
  userId: string,
  updates: Partial<Task>
): Promise<Task | null> => {
  const [task] = await db
    .update(tasks)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();

  return task || null;
};

export const deleteTask = async (
  id: string,
  userId: string
): Promise<boolean> => {
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));

  return true;
};
