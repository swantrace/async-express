import { verifyToken } from "./jwt";
import {
  Ok,
  Unauthorized,
  type Result,
  type ValidatedMetadata,
} from "../core/result";

// Authentication pipeline step for API routes
export async function authenticateUser(
  _: null,
  metadata: ValidatedMetadata<any>
): Promise<Result<{ userId: string; email: string; role: string }>> {
  const { cookies, headers } = metadata;
  const token = cookies?.token || headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return Unauthorized("No token provided");
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return Unauthorized("Invalid token");
  }

  return Ok(decoded);
}

// Authentication pipeline step for web routes (redirects to login)
export async function authenticateWebUser(
  _: null,
  metadata: ValidatedMetadata<any>
): Promise<Result<{ userId: string; email: string; role: string }>> {
  const { cookies } = metadata;
  const token = cookies?.token;

  if (!token) {
    return Unauthorized("No token provided");
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return Unauthorized("Invalid token");
  }

  return Ok(decoded);
}
