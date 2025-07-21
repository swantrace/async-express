import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./prisma";

const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite, { schema });

export type DbClient = typeof db;
