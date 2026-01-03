import { NextResponse } from "next/server";
import { loadQuestionsFromDisk } from "@/lib/questions.server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const questions = await loadQuestionsFromDisk();
  const countParam = url.searchParams.get("count");
  const count = countParam ? Number(countParam) : questions.length;
  const selected = questions.slice(0, Math.max(1, Math.min(count, questions.length)));

  return NextResponse.json(selected);
}
