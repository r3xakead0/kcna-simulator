import { evaluateAnswers } from "@/lib/evaluation";
import { getCorrectKeys, pickRandomQuestions } from "@/lib/questions";
import type { Question } from "@/types/exam";

const sampleQuestions: Question[] = [
  {
    published_iso: "2024-01-01T00:00:00Z",
    number: 1,
    question: "Sample single choice",
    options: [
      { key: "A", text: "Option A" },
      { key: "B", text: "Option B" },
    ],
    answers: { platform: ["B"], community: ["B"] },
  },
  {
    published_iso: "2024-01-02T00:00:00Z",
    number: 2,
    question: "Sample multi choice",
    options: [
      { key: "A", text: "Option A" },
      { key: "B", text: "Option B" },
      { key: "C", text: "Option C" },
    ],
    answers: { platform: ["A", "C"], community: ["A", "C"] },
  },
];

describe("question helpers", () => {
  it("returns platform answers by default", () => {
    expect(getCorrectKeys(sampleQuestions[0])).toEqual(["B"]);
  });

  it("randomly picks requested number of questions", () => {
    const selected = pickRandomQuestions(sampleQuestions, 1);
    expect(selected).toHaveLength(1);
    expect(sampleQuestions).toHaveLength(2);
  });
});

describe("evaluateAnswers", () => {
  it("marks fully correct answers", () => {
    const result = evaluateAnswers(sampleQuestions, { 1: ["B"], 2: ["A", "C"] });
    expect(result.correctCount).toBe(2);
    expect(result.rows.every((row) => row.isCorrect)).toBe(true);
  });

  it("marks incorrect when selection is partial", () => {
    const result = evaluateAnswers(sampleQuestions, { 1: ["B"], 2: ["A"] });
    const multiRow = result.rows.find((row) => row.question.number === 2);
    expect(multiRow?.isCorrect).toBe(false);
    expect(result.correctCount).toBe(1);
  });
});
