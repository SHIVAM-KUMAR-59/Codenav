"use client";

import { useRepository } from "client/hooks/use-repository";
import { CheckCircle2, AlertCircle, GitBranch, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { tokenStore } from "client/lib/api/axios";
import { SSE_STATUS_LABELS, SSE_STEPS } from "client/lib/constants";

type ProgressEvent = {
  status: string;
  progress: number;
  message: string;
};

export default function NewRepositoryPage() {
  const router = useRouter();
  const { analyzeRepositoryMutation } = useRepository();

  const [url, setUrl] = useState("");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [sseError, setSseError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const isCompleted = progress?.status === "COMPLETED";
  const isFailed = progress?.status === "FAILED";

  useEffect(() => {
    if (!analysisId) return;

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`;

    // SSE doesn't support custom headers — pass token as query param
    const es = new EventSource(
      `${apiUrl}/analyses/${analysisId}/status?token=${encodeURIComponent(getAccessToken())}`
    );

    eventSourceRef.current = es;

    es.onmessage = (e) => {
      try {
        const event: ProgressEvent = JSON.parse(e.data);
        setProgress(event);

        if (event.status === "COMPLETED" || event.status === "FAILED") {
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      setSseError("Lost connection to analysis stream.");
      es.close();
    };

    return () => {
      es.close();
    };
  }, [analysisId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSseError(null);
    setProgress(null);

    try {
      const result = await analyzeRepositoryMutation.mutateAsync(url);
      setAnalysisId(result.analysisId);
      setCached(result.cached);

      if (result.cached) {
        setProgress({ status: "COMPLETED", progress: 100, message: "Analysis complete" });
      }
    } catch {
      // error handled via mutation state
    }
  };

  const currentStepIndex = SSE_STEPS.indexOf(progress?.status ?? "");

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to dashboard
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Analyze a repository</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste a public GitHub URL to generate an architecture map, module graph, and learning
            paths.
          </p>
        </div>

        {/* Input form */}
        {!analysisId && (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="url" className="text-sm font-medium text-primary">
                  GitHub Repository URL
                </label>
                <input
                  id="url"
                  type="url"
                  placeholder="https://github.com/owner/repository"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
                />
              </div>

              <button
                type="submit"
                disabled={analyzeRepositoryMutation.isPending}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {analyzeRepositoryMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Starting analysis...
                  </>
                ) : (
                  <>
                    Analyze Repository
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {analyzeRepositoryMutation.isError && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={16} />
                  {analyzeRepositoryMutation.error?.message ??
                    "Failed to start analysis. Please try again."}
                </div>
              )}
            </div>
          </form>
        )}

        {/* Progress */}
        {analysisId && (
          <div className="rounded-2xl border border-border bg-card p-6">
            {cached && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                <CheckCircle2 size={16} />
                This repository was already analyzed at this commit — returning cached result.
              </div>
            )}

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-primary">{url}</p>
                <p className="text-xs text-muted-foreground">Analysis ID: {analysisId}</p>
              </div>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-3 mb-6">
              {SSE_STEPS.map((step, index) => {
                const isActive = progress?.status === step;
                const isDone = currentStepIndex > index || isCompleted;

                return (
                  <div key={step} className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-all ${
                        isDone
                          ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                          : isActive
                            ? "border-primary/30 bg-primary/20 text-primary"
                            : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 size={14} />
                      ) : isActive ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-sm transition-all ${
                        isDone
                          ? "text-emerald-400"
                          : isActive
                            ? "text-primary font-medium"
                            : "text-muted-foreground"
                      }`}
                    >
                      {SSE_STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            {!isCompleted && !isFailed && progress && (
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>{progress.message}</span>
                  <span>{progress.progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* SSE error */}
            {sseError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle size={16} />
                {sseError}
              </div>
            )}

            {/* Completed */}
            {isCompleted && (
              <button
                onClick={() => router.push(`/repositories/${analysisId}`)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                View Analysis
                <ArrowRight size={16} />
              </button>
            )}

            {/* Failed */}
            {isFailed && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={16} />
                  {progress?.message ?? "Analysis failed. Please try again."}
                </div>
                <button
                  onClick={() => {
                    setAnalysisId(null);
                    setProgress(null);
                    setSseError(null);
                  }}
                  className="rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-accent"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  // import tokenStore from lib/api/axios
  return tokenStore.get() ?? "";
}
