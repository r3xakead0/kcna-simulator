"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { evaluateAnswers } from "@/lib/evaluation";
import { getCorrectKeys } from "@/lib/questions";
import { RESULTS_STORAGE_KEY, USER_STORAGE_KEY } from "@/lib/constants";
import type {
  AnswerSheet,
  EvaluationResult,
  Question,
  UserRecord,
} from "@/types/exam";

type AuthenticatedUser = Pick<UserRecord, "username" | "name">;
const PAGE_SIZE = 1;

export default function Home() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswerSheet>({});
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCorrect, setShowCorrect] = useState<Record<number, boolean>>({});
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthenticatedUser);
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    setAnswers({});
    setEvaluation(null);
    setCurrentPage(1);
    setShowCorrect({});
  }, [questions]);

  const handleLogout = () => {
    setUser(null);
    setQuestions([]);
    setAnswers({});
    setEvaluation(null);
    setSubmitError(null);
    setCurrentPage(1);
    setShowCorrect({});
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const completion = useMemo(() => {
    if (!questions.length) return 0;
    const answered = Object.keys(answers).filter(
      (key) => answers[Number(key)]?.length,
    ).length;
    return Math.round((answered / questions.length) * 100);
  }, [answers, questions.length]);

  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const pagedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return questions.slice(start, end);
  }, [questions, currentPage]);

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
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(payload));
      }
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
    if (typeof window !== "undefined") {
      localStorage.setItem(
        RESULTS_STORAGE_KEY,
        JSON.stringify({ result, generatedAt: new Date().toISOString() }),
      );
    }
    router.push("/results");
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 px-4 pb-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {user ? (
            <>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 shadow dark:bg-slate-800 dark:text-slate-200">
                Signed in as {user.name}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300/60 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-600 dark:hover:text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to start the simulation
            </div>
          )}
        </div>

        <section className="space-y-4">
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
              {pagedQuestions.map((question) => {
                const correct = getCorrectKeys(question);
                const isMultiple = correct.length > 1;
                const isShowingCorrect = showCorrect[question.number] ?? false;
                return (
                  <QuestionCard
                    key={question.number}
                    question={question}
                    correctKeys={correct}
                    selected={answers[question.number] ?? []}
                    onSelect={(choice) =>
                      isMultiple
                        ? handleOptionToggle(question.number, choice)
                        : handleOptionSelect(question.number, choice)
                    }
                    isMultiple={isMultiple}
                    showCorrect={isShowingCorrect}
                    onToggleCorrect={() =>
                      setShowCorrect((current) => ({
                        ...current,
                        [question.number]: !isShowingCorrect,
                      }))
                    }
                  />
                );
              })}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onFirst={() => setCurrentPage(1)}
                onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                onLast={() => setCurrentPage(totalPages)}
              />
            </div>
          )}
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
            {questionCountLabel} questions per run (sorted by newest first).
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load questions"}
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
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
          Answers submitted. View your score on the Results page.
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  correctKeys,
  selected,
  onSelect,
  isMultiple,
  showCorrect,
  onToggleCorrect,
}: {
  question: Question;
  correctKeys: string[];
  selected: string[];
  onSelect: (option: string) => void;
  isMultiple: boolean;
  showCorrect: boolean;
  onToggleCorrect: () => void;
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
            Published {new Date(question.published_iso).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-50 dark:bg-slate-800">
          {isMultiple ? "Select all that apply" : "Single choice"}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleCorrect}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-100 dark:hover:border-emerald-400 dark:hover:text-emerald-200"
        >
          {showCorrect ? "Hide correct answer" : "Show correct answer"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {question.options.map((option) => {
          const isChecked = selected.includes(option.key);
          const isCorrect = showCorrect && correctKeys.includes(option.key);
          const highlightClasses = isCorrect
            ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-900/40 dark:text-emerald-50"
            : isChecked
              ? "border-blue-500 bg-blue-50 text-blue-900 dark:border-sky-500 dark:bg-sky-900/50 dark:text-sky-50"
              : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50";
          return (
            <label
              key={option.key}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition hover:border-blue-300 hover:shadow-md dark:hover:border-sky-700 ${highlightClasses}`}
            >
              <input
                type={isMultiple ? "checkbox" : "radio"}
                name={`question-${question.number}`}
                value={option.key}
                checked={isChecked}
                onChange={() => onSelect(option.key)}
                className="mt-1 h-4 w-4 accent-blue-600 dark:accent-sky-400"
              />
              <div className="flex items-center gap-2 text-left">
                <span className="font-semibold">{option.key}.</span>
                <span className="text-slate-700 dark:text-slate-200">{option.text}</span>
              </div>
            </label>
          );
        })}
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
}: {
  currentPage: number;
  totalPages: number;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <div className="text-slate-700 dark:text-slate-200">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onFirst}
          disabled={currentPage <= 1}
          className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-sky-600"
        >
          First
        </button>
        <button
          type="button"
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-sky-600"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-sky-600"
        >
          Next
        </button>
        <button
          type="button"
          onClick={onLast}
          disabled={currentPage >= totalPages}
          className="rounded-lg border border-slate-200 px-3 py-2 font-medium text-slate-700 shadow-sm transition hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-100 dark:hover:border-sky-600"
        >
          Last
        </button>
      </div>
    </div>
  );
}
