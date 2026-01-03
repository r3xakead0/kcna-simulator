import type { Question } from "@/types/exam";

export function pickRandomQuestions(
  questions: Question[],
  count: number,
): Question[] {
  const pool = [...questions];
  const selected: Question[] = [];

  while (pool.length && selected.length < count) {
    const index = Math.floor(Math.random() * pool.length);
    const [question] = pool.splice(index, 1);
    selected.push(question);
  }

  return selected;
}

export function getCorrectKeys(question: Question): string[] {
  const { platform, community } = question.answers;
  return platform?.length ? platform : community;
}
