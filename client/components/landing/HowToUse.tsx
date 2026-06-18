import React from "react";

const steps = [
  "Paste a public GitHub repository URL",
  "Codenav analyzes structure, files, modules, and graph",
  "Explore tabs or ask AI questions about the codebase",
];

const HowToUse = () => {
  return (
    <section id="how-it-works" className="border-y border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-muted-foreground">How to use</p>
          <h2 className="text-3xl font-semibold md:text-5xl">
            From GitHub URL to codebase clarity in minutes.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step} className="relative rounded-2xl border border-border bg-background p-6">
              <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold">{step}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {index === 0
                  ? "Start with any public repository you want to understand."
                  : index === 1
                    ? "Codenav builds a structured view of the repository internals."
                    : "Use the generated insights to explore confidently."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowToUse;
