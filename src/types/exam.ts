export type AnswerSource = {
  platform: string[];
  community: string[];
};

export type QuestionOption = {
  key: string;
  text: string;
};

export type Question = {
  published_iso: string;
  number: number;
  question: string;
  options: QuestionOption[];
  answers: AnswerSource;
};

export type UserRecord = {
  username: string;
  password: string;
  name: string;
};

export type AnswerSheet = Record<number, string[]>;

export type EvaluationRow = {
  question: Question;
  selected: string[];
  correct: string[];
  isCorrect: boolean;
};

export type EvaluationResult = {
  total: number;
  correctCount: number;
  rows: EvaluationRow[];
};
