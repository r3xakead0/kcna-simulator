import { readFile } from "fs/promises";
import path from "path";
import type { UserRecord } from "@/types/exam";

export async function loadUsersFromDisk(): Promise<UserRecord[]> {
  const filePath = path.join(process.cwd(), "data", "users.json");
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as UserRecord[];
}

export async function validateUserCredentials(
  username: string,
  password: string,
): Promise<UserRecord | null> {
  const users = await loadUsersFromDisk();
  return (
    users.find(
      (user) =>
        user.username.toLowerCase() === username.toLowerCase() &&
        user.password === password,
    ) ?? null
  );
}
