import React from "react";
import { Brain, GitBranch, Search, Workflow } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Repository understanding",
    description:
      "Analyze unfamiliar codebases and quickly understand modules, entry points, dependencies, and structure.",
  },
  {
    icon: Brain,
    title: "Ask AI about the code",
    description:
      "Ask questions like how authentication works, where a request flows, or what depends on a file.",
  },
  {
    icon: Workflow,
    title: "Generated learning paths",
    description:
      "Get guided file-by-file paths for auth, request lifecycle, database layer, workers, and more.",
  },
  {
    icon: GitBranch,
    title: "Dependency graph",
    description: "Visualize how files connect so you can reason about impact before changing code.",
  },
];

const Features = () => {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-medium text-muted-foreground">Features</p>
        <h2 className="text-3xl font-semibold md:text-5xl">
          Everything you need to inspect a codebase before touching it.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-border bg-card p-5 transition duration-300 hover:-translate-y-1 hover:bg-accent"
          >
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary transition group-hover:bg-background">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
