"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { RESULTS_STORAGE_KEY } from "@/lib/constants";
import type { EvaluationResult } from "@/types/exam";

type StoredResult = {
  result: EvaluationResult;
  generatedAt: string;
};

const formatChoices = (keys: string[], options: { key: string; text: string }[]) =>
  keys.map((key) => {
    const match = options.find((option) => option.key === key);
    return match ? `${match.key}. ${match.text}` : key;
  });

export default function ResultsPage() {
  const [storedResult, setStoredResult] = useState<StoredResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(RESULTS_STORAGE_KEY);
    if (!raw) {
      setError("No submitted exam found. Complete the exam to view results.");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredResult;
      setStoredResult(parsed);
    } catch {
      setError("Could not read stored results. Submit the exam again.");
    }
  }, []);

  const summary = useMemo(() => {
    if (!storedResult) return null;
    const { result } = storedResult;
    const accuracy = Math.round((result.correctCount / result.total) * 100);
    return { accuracy };
  }, [storedResult]);

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 px-4 pb-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Results</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Review your score and per-question breakdown.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-sky-600"
          >
            Back to exam
          </Link>
        </div>
        {storedResult && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generated at {new Date(storedResult.generatedAt).toLocaleString()}
          </p>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {storedResult && summary && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Score" value={`${storedResult.result.correctCount}/${storedResult.result.total}`} />
              <StatCard label="Accuracy" value={`${summary.accuracy}%`} tone="accent" />
              <StatCard
                label="Needs review"
                value={`${storedResult.result.total - storedResult.result.correctCount}`}
                tone="warning"
              />
            </div>

            <div className="rounded-3xl border border-emerald-200/70 bg-emerald-50/80 p-6 text-sm shadow-lg shadow-emerald-200/40 dark:border-emerald-900/70 dark:bg-emerald-950/60">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 size={18} />
                Detailed breakdown
              </h3>
              <div className="mt-4 space-y-3">
                {storedResult.result.rows.map((row) => (
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
                      Selected:{" "}
                      {row.selected.length
                        ? formatChoices(row.selected, row.question.options).join(", ")
                        : "No answer"}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Correct: {formatChoices(row.correct, row.question.options).join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "accent" | "warning";
}) {
  const toneClasses: Record<"default" | "accent" | "warning", string> = {
    default: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100",
    accent: "bg-blue-100 text-blue-800 dark:bg-sky-900/50 dark:text-sky-100",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-100",
  };

  return (
    <div className={`rounded-2xl px-4 py-3 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-xs uppercase tracking-[0.15em]">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
