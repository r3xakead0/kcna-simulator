import { NextResponse } from "next/server";
import { loadQuestionsFromDisk } from "@/lib/questions.server";
import { pickRandomQuestions } from "@/lib/questions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const count = Number(url.searchParams.get("count") ?? 5);

  const questions = await loadQuestionsFromDisk();
  const selected = pickRandomQuestions(questions, Math.max(1, count));

  return NextResponse.json(selected);
}
