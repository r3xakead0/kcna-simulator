import type {
  AnswerSheet,
  EvaluationResult,
  EvaluationRow,
  Question,
} from "@/types/exam";
import { getCorrectKeys } from "./questions";

export function evaluateAnswers(
  questions: Question[],
  answers: AnswerSheet,
): EvaluationResult {
  const rows: EvaluationRow[] = questions.map((question) => {
    const correct = getCorrectKeys(question);
    const selected = answers[question.number] ?? [];
    const isCorrect =
      selected.length === correct.length &&
      selected.every((choice) => correct.includes(choice));

    return { question, selected, correct, isCorrect };
  });

  const correctCount = rows.filter((row) => row.isCorrect).length;

  return {
    total: questions.length,
    correctCount,
    rows,
  };
}
