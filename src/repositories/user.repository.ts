import { db } from "../db/client";
import { users, type User, type NewUser } from "../db/prisma";
import { eq } from "drizzle-orm";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return result[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
};

export const createUser = async (
  userData: Omit<NewUser, "id" | "createdAt" | "updatedAt">
): Promise<User> => {
  const [user] = await db.insert(users).values(userData).returning();
  return user!;
};

export const updateUser = async (
  id: string,
  updates: Partial<User>
): Promise<User | null> => {
  const [user] = await db
    .update(users)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return user || null;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  await db.delete(users).where(eq(users.id, id));
  return true;
};
