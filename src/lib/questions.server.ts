import { readdir, readFile } from "fs/promises";
import path from "path";
import type { Question } from "@/types/exam";

export async function loadQuestionsFromDisk(): Promise<Question[]> {
  const questionsDir = path.join(process.cwd(), "data", "questions");
  const files = await readdir(questionsDir);

  const questionFiles = files.filter((file) => file.endsWith(".json"));
  const questions = await Promise.all(
    questionFiles.map(async (file) => {
      const raw = await readFile(path.join(questionsDir, file), "utf-8");
      return JSON.parse(raw) as Question;
    }),
  );

  return questions.sort((a, b) => a.number - b.number);
}
