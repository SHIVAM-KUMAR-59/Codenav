import { BookOpen } from "lucide-react";
import React from "react";

const reasons = [
  "Onboard faster to large repositories",
  "Contribute to open source with more confidence",
  "Review unfamiliar architecture before editing",
  "Trace flows without manually opening dozens of files",
];

const WhyUseIt = () => {
  return (
    <section id="why" className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1fr]">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Why use it</p>
        <h2 className="text-3xl font-semibold md:text-5xl">
          Built for developers who read before they rewrite.
        </h2>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          Large repositories are rarely hard because of syntax. They are hard because context is
          scattered. Codenav gives you that context before you dive in.
        </p>
      </div>

      <div className="grid gap-3">
        {reasons.map((reason) => (
          <div
            key={reason}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:bg-accent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium">{reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyUseIt;
