"use client";

import { useAnalysis } from "client/hooks/use-analysis";
import {
  AlertCircle,
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  Code2,
  FileCode,
  GitBranch,
  Globe,
  Layers,
  Loader2,
  Server,
  Terminal,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import ReactFlow, { Background, Controls, MiniMap, type Edge, type Node } from "reactflow";
import "reactflow/dist/style.css";

const TABS = ["Overview", "Modules", "Entry Points", "Learning Paths", "Graph"] as const;
type Tab = (typeof TABS)[number];

const ENTRY_POINT_ICONS: Record<string, React.ReactNode> = {
  server: <Server size={14} />,
  cli: <Terminal size={14} />,
  export: <Box size={14} />,
  route: <Globe size={14} />,
  worker: <Workflow size={14} />,
};

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Go: "bg-cyan-400",
  Rust: "bg-orange-500",
  default: "bg-muted-foreground",
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-secondary ${className}`} />;
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 flex-1" />
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RepositoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { fetchAnalysisQuery } = useAnalysis(id);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  const analysis = fetchAnalysisQuery.data;
  const loading = fetchAnalysisQuery.isLoading;
  const error = fetchAnalysisQuery.error;

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              {loading ? (
                <>
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="mt-2 h-4 w-32" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {analysis?.repository?.name ?? "Repository"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {analysis?.repository?.owner} • {analysis?.commitSha?.slice(0, 7)}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
            <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
            <h2 className="text-lg font-semibold">Failed to load analysis</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn&apos;t fetch this analysis. Please try again.
            </p>
            <button
              onClick={() => fetchAnalysisQuery.refetch()}
              className="mt-6 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-medium hover:bg-accent"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-secondary text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "Overview" &&
              (loading ? (
                <OverviewSkeleton />
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                      { label: "Total Files", value: analysis?.graph?.nodes?.length ?? 0 },
                      { label: "Modules", value: analysis?.modules?.length ?? 0 },
                      { label: "Entry Points", value: analysis?.entryPoints?.length ?? 0 },
                      { label: "Learning Paths", value: analysis?.learningPaths?.length ?? 0 },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-border bg-card p-5"
                      >
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <h2 className="mt-2 text-3xl font-semibold">{stat.value}</h2>
                      </div>
                    ))}
                  </div>

                  {/* Languages */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 font-semibold">Languages</h3>
                    {!analysis?.languageStats?.length ? (
                      <p className="text-sm text-muted-foreground">No language data available.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {analysis.languageStats.map((lang) => (
                          <div key={lang.language} className="flex items-center gap-3">
                            <span className="w-24 text-sm text-muted-foreground">
                              {lang.language}
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${LANGUAGE_COLORS[lang.language] ?? LANGUAGE_COLORS.default}`}
                                style={{ width: `${lang.percentage}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-sm text-muted-foreground">
                              {lang.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Analysis metadata */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 font-semibold">Analysis details</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                      {[
                        { label: "Status", value: analysis?.status },
                        { label: "Commit SHA", value: analysis?.commitSha?.slice(0, 7) },
                        {
                          label: "Started",
                          value: analysis?.startedAt
                            ? new Date(analysis.startedAt).toLocaleString()
                            : "—",
                        },
                        {
                          label: "Completed",
                          value: analysis?.completedAt
                            ? new Date(analysis.completedAt).toLocaleString()
                            : "—",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between border-b border-border pb-3"
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

            {/* Modules Tab */}
            {activeTab === "Modules" &&
              (loading ? (
                <ListSkeleton />
              ) : (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="font-semibold">Modules</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Top-level folders detected as modules in this repository.
                    </p>
                  </div>
                  {!analysis?.modules?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Layers className="mb-4 h-10 w-10 text-muted-foreground" />
                      <p className="font-medium">No modules detected</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This repository has no detectable module structure.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {analysis.modules.map((mod) => (
                        <div key={mod.id} className="px-5 py-4">
                          <button
                            className="flex w-full items-center justify-between text-left"
                            onClick={() => setExpandedPath(expandedPath === mod.id ? null : mod.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary">
                                <Layers size={16} className="text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{mod.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {mod.fileCount} files
                                </p>
                              </div>
                            </div>
                            {expandedPath === mod.id ? (
                              <ChevronDown size={16} className="text-muted-foreground" />
                            ) : (
                              <ChevronRight size={16} className="text-muted-foreground" />
                            )}
                          </button>
                          {expandedPath === mod.id && (
                            <div className="mt-3 ml-12 flex flex-col gap-1">
                              {mod.files.slice(0, 20).map((file) => (
                                <div
                                  key={file}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <FileCode size={12} />
                                  {file}
                                </div>
                              ))}
                              {mod.files.length > 20 && (
                                <p className="text-xs text-muted-foreground">
                                  +{mod.files.length - 20} more files
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {/* Entry Points Tab */}
            {activeTab === "Entry Points" &&
              (loading ? (
                <ListSkeleton />
              ) : (
                <div className="rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="font-semibold">Entry points</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Key files where execution begins or public APIs are exposed.
                    </p>
                  </div>
                  {!analysis?.entryPoints?.length ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Code2 className="mb-4 h-10 w-10 text-muted-foreground" />
                      <p className="font-medium">No entry points detected</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No known entry point patterns were found.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {analysis.entryPoints.map((ep) => (
                        <div key={ep.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-primary">
                            {ENTRY_POINT_ICONS[ep.type] ?? <Code2 size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium text-sm">{ep.path}</p>
                            <p className="text-xs text-muted-foreground">{ep.description}</p>
                          </div>
                          <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                            {ep.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

            {/* Learning Paths Tab */}
            {activeTab === "Learning Paths" &&
              (loading ? (
                <ListSkeleton />
              ) : (
                <div className="flex flex-col gap-4">
                  {!analysis?.learningPaths?.length ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
                      <BookOpen className="mb-4 h-10 w-10 text-muted-foreground" />
                      <p className="font-medium">No learning paths generated</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No known flow patterns were detected in this repository.
                      </p>
                    </div>
                  ) : (
                    analysis.learningPaths.map((path) => (
                      <div key={path.id} className="rounded-2xl border border-border bg-card">
                        <div className="border-b border-border px-5 py-4">
                          <h3 className="font-semibold">{path.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{path.description}</p>
                        </div>
                        <div className="divide-y divide-border">
                          {path.files.map((step, index) => (
                            <div key={step.path} className="flex items-start gap-4 px-5 py-4">
                              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-xs font-medium text-muted-foreground">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-mono text-sm text-primary">{step.path}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{step.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}

            {/* Graph Tab */}
            {activeTab === "Graph" &&
              (loading ? (
                <div className="rounded-2xl border border-border bg-card" style={{ height: 600 }}>
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </div>
              ) : !analysis?.graph?.nodes?.length ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20 text-center">
                  <GitBranch className="mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">No graph data available</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The dependency graph could not be generated for this repository.
                  </p>
                </div>
              ) : (
                <div
                  className="rounded-2xl border border-border bg-card overflow-hidden"
                  style={{ height: 600 }}
                >
                  <ReactFlowGraph nodes={analysis.graph.nodes} edges={analysis.graph.edges} />
                </div>
              ))}
          </>
        )}
      </div>
    </main>
  );
}

function ReactFlowGraph({
  nodes,
  edges,
}: {
  nodes: import("client/lib/types").CodeNode[];
  edges: import("client/lib/types").CodeEdge[];
}) {
  const flowNodes: Node[] = nodes.slice(0, 200).map((node, index) => ({
    id: node.id,
    position: {
      x: (index % 10) * 200,
      y: Math.floor(index / 10) * 100,
    },
    data: { label: node.name },
    style: {
      background: "oklch(0.2 0 0)",
      border: "1px solid oklch(0.3 0 0)",
      borderRadius: 8,
      color: "oklch(0.96 0 0)",
      fontSize: 11,
      padding: "4px 8px",
    },
  }));

  const nodeIds = new Set(flowNodes.map((n) => n.id));

  const flowEdges: Edge[] = edges
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .slice(0, 500)
    .map((edge, index) => ({
      id: `edge-${index}`,
      source: edge.source,
      target: edge.target,
      style: { stroke: "oklch(0.35 0 0)", strokeWidth: 1 },
    }));

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      fitView
      minZoom={0.1}
      attributionPosition="bottom-right"
    >
      <Background color="oklch(0.2 0 0)" gap={16} />
      <Controls />
      <MiniMap nodeColor="oklch(0.3 0 0)" maskColor="oklch(0.12 0 0 / 0.8)" />
    </ReactFlow>
  );
}
