import React from "react";
import Link from "next/link";
import { ArrowRight, Layers, Lock, Sparkles, Zap } from "lucide-react";

const Hero = () => {
  return (
    <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[1fr_0.9fr] lg:pt-24">
      <div>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
          <Sparkles className="h-4 w-4 text-foreground" />
          Navigate any codebase like you already know it
        </div>

        <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
          Understand repositories without getting lost in the files.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Codenav turns public GitHub repositories into maps, modules, learning paths, and
          AI-powered explanations so you can onboard, contribute, and review with clarity.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/auth"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Start analyzing
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold transition hover:bg-accent"
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-4 rounded-4xl bg-primary/10 blur-2xl" />
        <div className="relative rounded-4xl border border-border bg-card/80 p-4 shadow-2xl backdrop-blur">
          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Repository map</p>
                <p className="text-xs text-muted-foreground">expressjs / express</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                analyzed
              </span>
            </div>

            <div className="grid gap-3">
              {["server.ts", "routes/auth.route.ts", "services/auth.service.ts"].map(
                (file, index) => (
                  <div
                    key={file}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-secondary/60 p-3 transition hover:-translate-y-0.5 hover:bg-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background">
                      {index === 0 ? (
                        <Zap className="h-4 w-4" />
                      ) : index === 1 ? (
                        <Layers className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-sm">{file}</p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0
                          ? "Entry point"
                          : index === 1
                            ? "Route layer"
                            : "Business logic"}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <p className="mb-2 text-xs text-muted-foreground">Ask AI</p>
              <p className="text-sm">How does authentication work?</p>
              <div className="mt-3 rounded-lg bg-secondary p-3 text-xs leading-5 text-muted-foreground">
                Authentication starts in the auth route, delegates validation to the controller,
                then uses the auth service to issue tokens and persist refresh sessions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
