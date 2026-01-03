"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { evaluateAnswers } from "@/lib/evaluation";
import { getCorrectKeys } from "@/lib/questions";
import type {
  AnswerSheet,
  EvaluationResult,
  Question,
  UserRecord,
} from "@/types/exam";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthenticatedUser = Pick<UserRecord, "username" | "name" | "role">;

export default function Home() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerSheet>({});
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setAnswers({});
    setEvaluation(null);
  }, [questions]);

  const handleLogout = () => {
    setUser(null);
    setQuestions([]);
    setAnswers({});
    setEvaluation(null);
    setSubmitError(null);
  };

  const completion = useMemo(() => {
    if (!questions.length) return 0;
    const answered = Object.keys(answers).filter(
      (key) => answers[Number(key)]?.length,
    ).length;
    return Math.round((answered / questions.length) * 100);
  }, [answers, questions.length]);

  const handleLogin = async (formData: FormData) => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      const username = formData.get("username");
      const password = formData.get("password");
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Login failed");
      }

      const payload = (await response.json()) as AuthenticatedUser;
      setUser(payload);
    } catch (error) {
      setLoginError((error as Error).message);
    } finally {
      setLoginLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionLoading(true);
    setSubmitError(null);
    setEvaluation(null);
    setAnswers({});
    try {
      const response = await fetch("/api/questions");
      if (!response.ok) {
        throw new Error("Unable to load questions.");
      }
      const payload = (await response.json()) as Question[];
      setQuestions(payload);
    } catch (error) {
      setSubmitError((error as Error).message);
    } finally {
      setQuestionLoading(false);
    }
  };

  const handleOptionToggle = (questionNumber: number, optionKey: string) => {
    setAnswers((current) => {
      const existing = current[questionNumber] ?? [];
      const updated = existing.includes(optionKey)
        ? existing.filter((key) => key !== optionKey)
        : [...existing, optionKey];
      return { ...current, [questionNumber]: updated };
    });
  };

  const handleOptionSelect = (questionNumber: number, optionKey: string) => {
    setAnswers((current) => ({ ...current, [questionNumber]: [optionKey] }));
  };

  const handleSubmit = () => {
    if (!questions.length) {
      setSubmitError("Load questions before submitting the exam.");
      return;
    }
    setSubmitError(null);
    const result = evaluateAnswers(questions, answers);
    setEvaluation(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 px-4 pb-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 pt-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/40 bg-card/70 p-6 shadow-lg shadow-blue-200/50 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 dark:text-sky-400">
              KCNA Simulation
            </p>
            <h1 className="text-3xl font-semibold">Linux Foundation KCNA Exam Lab</h1>
            <p className="max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Practice with curated KCNA-style questions, review your answers instantly, and switch between light and dark modes for long study sessions.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <ThemeToggle />
            {user ? (
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 shadow dark:bg-slate-800 dark:text-slate-200">
                  <ShieldCheck size={16} />
                  {user.name} ({user.role})
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-300/60 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-600 dark:hover:text-red-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Sign in to start the simulation
              </div>
            )}
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {!user && (
              <LoginCard
                onSubmit={handleLogin}
                loading={loginLoading}
                error={loginError}
              />
            )}

            {user && (
              <ExamControlCard
                onStart={fetchQuestions}
                onSubmit={handleSubmit}
                canSubmit={!!questions.length}
                loading={questionLoading}
                evaluation={evaluation}
                completion={completion}
                questionCount={questions.length}
              />
            )}

            {submitError && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">
                <AlertCircle size={16} />
                {submitError}
              </div>
            )}

            {user && questions.length > 0 && (
              <div className="space-y-4">
                {questions.map((question) => {
                  const correct = getCorrectKeys(question);
                  const isMultiple = correct.length > 1;
                  return (
                    <QuestionCard
                      key={question.number}
                      question={question}
                      selected={answers[question.number] ?? []}
                      onSelect={(choice) =>
                        isMultiple
                          ? handleOptionToggle(question.number, choice)
                          : handleOptionSelect(question.number, choice)
                      }
                      isMultiple={isMultiple}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <HighlightsPanel evaluation={evaluation} completion={completion} />
            <InstructionsCard />
            {evaluation && <ResultsPanel evaluation={evaluation} />}
          </aside>
        </section>
      </div>
    </div>
  );
}

function LoginCard({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="rounded-3xl border border-white/40 bg-card/80 p-6 shadow-lg shadow-blue-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Login</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Credentials are verified against the local JSON roster.
          </p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-sky-900/60 dark:text-sky-200">
          Offline safe
        </div>
      </div>

      <form
        className="mt-4 grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(new FormData(event.currentTarget));
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Username
          </span>
          <input
            name="username"
            required
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-sky-400 dark:focus:ring-sky-900/80"
            placeholder="demo"
            autoComplete="username"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-sky-400 dark:focus:ring-sky-900/80"
            placeholder="•••••••"
            autoComplete="current-password"
          />
        </label>

        <div className="md:col-span-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 dark:shadow-sky-900/50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </button>
          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-300">
              <AlertCircle size={16} />
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

function ExamControlCard({
  onStart,
  onSubmit,
  canSubmit,
  loading,
  evaluation,
  completion,
  questionCount,
}: {
  onStart: () => Promise<void>;
  onSubmit: () => void;
  canSubmit: boolean;
  loading: boolean;
  evaluation: EvaluationResult | null;
  completion: number;
  questionCount: number;
}) {
  const questionCountLabel =
    questionCount > 0 ? `${questionCount}` : "All available";

  return (
    <div className="rounded-3xl border border-white/40 bg-card/90 p-6 shadow-lg shadow-blue-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Exam session</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {questionCountLabel} randomized questions per run.
          </p>
        </div>
        <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-50 dark:bg-slate-700">
          Progress {completion}%
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStart}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-slate-400/50 transition hover:translate-y-[-1px] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-800 dark:shadow-slate-950"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load new set"}
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300 transition hover:translate-y-[-1px] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-700 dark:bg-sky-500 dark:text-slate-900 dark:shadow-sky-900/50"
        >
          <CheckCircle2 size={16} />
          Submit answers
        </button>
      </div>

      {evaluation && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Badge label="Total" value={`${evaluation.total}`} />
          <Badge label="Correct" value={`${evaluation.correctCount}`} tone="success" />
          <Badge
            label="Accuracy"
            value={`${Math.round((evaluation.correctCount / evaluation.total) * 100)}%`}
            tone="accent"
          />
          <Badge
            label="Needs review"
            value={`${evaluation.total - evaluation.correctCount}`}
            tone="warning"
          />
        </div>
      )}
    </div>
  );
}

function Badge({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "accent" | "warning";
}) {
  const toneClasses: Record<"default" | "success" | "accent" | "warning", string> = {
    default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-100",
    accent: "bg-blue-100 text-blue-800 dark:bg-sky-900/50 dark:text-sky-100",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-100",
  };

  return (
    <div className={`rounded-2xl px-4 py-3 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function QuestionCard({
  question,
  selected,
  onSelect,
  isMultiple,
}: {
  question: Question;
  selected: string[];
  onSelect: (option: string) => void;
  isMultiple: boolean;
}) {
  return (
    <article className="rounded-3xl border border-white/50 bg-card/90 p-6 shadow-lg shadow-blue-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-sky-400">
            Question {question.number}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-foreground">
            {question.question}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Published {new Date(question.published_iso).toLocaleDateString()} •{" "}
            <a
              className="underline decoration-dotted underline-offset-4"
              href={question.url}
              target="_blank"
              rel="noreferrer"
            >
              Source
            </a>
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-50 dark:bg-slate-800">
          {isMultiple ? "Select all that apply" : "Single choice"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {question.options.map((option) => {
          const isChecked = selected.includes(option.key);
          return (
            <label
              key={option.key}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition hover:border-blue-300 hover:shadow-md dark:hover:border-sky-700 ${
                isChecked
                  ? "border-blue-500 bg-blue-50 text-blue-900 dark:border-sky-500 dark:bg-sky-900/50 dark:text-sky-50"
                  : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
              }`}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={`question-${question.number}`}
                value={option.key}
                checked={isChecked}
                onChange={() => onSelect(option.key)}
                className="mt-1 h-4 w-4 accent-blue-600 dark:accent-sky-400"
              />
              <div>
                <p className="font-semibold">{option.key}</p>
                <p className="text-slate-700 dark:text-slate-200">{option.text}</p>
              </div>
            </label>
          );
        })}
      </div>
    </article>
  );
}

function HighlightsPanel({
  evaluation,
  completion,
}: {
  evaluation: EvaluationResult | null;
  completion: number;
}) {
  const stats = evaluation
    ? {
        label: "Score",
        value: `${evaluation.correctCount}/${evaluation.total}`,
        accent: "bg-gradient-to-r from-emerald-500 to-emerald-400",
      }
    : {
        label: "Completion",
        value: `${completion}%`,
        accent: "bg-gradient-to-r from-blue-500 to-sky-400",
      };

  return (
    <div className="overflow-hidden rounded-3xl border border-white/40 bg-card/90 shadow-lg shadow-blue-200/40 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <div className={`${stats.accent} px-6 py-4 text-white`}>
        <p className="text-xs uppercase tracking-[0.2em] opacity-90">{stats.label}</p>
        <p className="text-3xl font-semibold">{stats.value}</p>
      </div>
      <div className="space-y-3 p-6 text-sm text-slate-700 dark:text-slate-200">
        <p>
          Track your progress live. Submit the exam to reveal which answers were correct and which ones
          need another look.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-slate-600 dark:text-slate-300">
          <li>Randomized question sets per run.</li>
          <li>Supports single and multiple choice items.</li>
          <li>Dark and light modes for long study sessions.</li>
        </ul>
      </div>
    </div>
  );
}

function InstructionsCard() {
  return (
    <div className="rounded-3xl border border-dashed border-blue-200 bg-white/70 p-6 text-sm shadow-sm dark:border-sky-800 dark:bg-slate-900/80">
      <h3 className="text-lg font-semibold text-foreground">How this simulator works</h3>
      <ol className="mt-3 space-y-2 text-slate-700 dark:text-slate-200">
        <li>1. Sign in using a user stored in <code>data/users.json</code>.</li>
        <li>2. Load a fresh question set sourced from <code>data/questions</code>.</li>
        <li>3. Submit to see correct and incorrect responses instantly.</li>
      </ol>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        All content lives in JSON files, making it easy to extend the bank or connect to other tools.
      </p>
    </div>
  );
}

function ResultsPanel({ evaluation }: { evaluation: EvaluationResult }) {
  return (
    <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/80 p-6 text-sm shadow-lg shadow-emerald-200/40 dark:border-emerald-900/70 dark:bg-emerald-950/60">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
        <CheckCircle2 size={18} />
        Results
      </h3>
      <p className="mt-2 text-slate-700 dark:text-emerald-50">
        Review each item to understand what was marked correct.
      </p>
      <div className="mt-4 space-y-3">
        {evaluation.rows.map((row) => (
          <div
            key={row.question.number}
            className="rounded-2xl bg-white/80 p-4 shadow-sm dark:bg-slate-900/80"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-foreground">
                Q{row.question.number}: {row.question.question}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  row.isCorrect
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-100"
                }`}
              >
                {row.isCorrect ? "Correct" : "Review"}
              </span>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Selected: {row.selected.length ? row.selected.join(", ") : "No answer"}
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Correct: {row.correct.join(", ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
