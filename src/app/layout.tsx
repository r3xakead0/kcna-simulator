import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KCNA Exam Simulator",
  description: "Practice KCNA-style questions with a lightweight simulator.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-slate-200 bg-card/80 backdrop-blur px-4 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="mx-auto flex max-w-6xl flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.25em] text-blue-600 dark:text-sky-400">
                  KCNA Simulation
                </p>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground">
                      Linux Foundation - KCNA Exam
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Practice KCNA-style questions with local data and instant feedback.
                    </p>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white/80 px-4 py-4 text-center text-sm text-slate-600 shadow-inner dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
              View the source on{" "}
              <a
                href="https://github.com/r3xakead0/kcna-simulator"
                className="font-semibold text-blue-600 underline decoration-dotted underline-offset-4 dark:text-sky-400"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
              .
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
