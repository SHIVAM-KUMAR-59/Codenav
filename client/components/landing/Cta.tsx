import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const Cta = () => {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-4xl border border-border bg-card p-8 md:p-12">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <h2 className="text-3xl font-semibold md:text-5xl">
            Stop opening random files. Start navigating with intent.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Analyze your first repository and turn codebase confusion into a clear map.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Try Codenav
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cta;
