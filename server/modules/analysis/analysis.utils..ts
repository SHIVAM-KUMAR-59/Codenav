import { QueryType } from "./analysis.types";

const FLOW_PATTERNS = [
  /how does .* work/i,
  /walk me through/i,
  /explain .* flow/i,
  /request lifecycle/i,
  /trace/i,
  /lifecycle/i,
  /pipeline/i,
  /process/i,
  /what happens when/i,
];

const IMPACT_PATTERNS = [
  /what depends on/i,
  /what imports/i,
  /what would break/i,
  /impact of/i,
  /affected by/i,
  /who uses/i,
  /dependents of/i,
];

export function classifyQuery(question: string): QueryType {
  if (IMPACT_PATTERNS.some((p) => p.test(question))) return "impact";
  if (FLOW_PATTERNS.some((p) => p.test(question))) return "flow";
  return "file";
}

export interface GraphNode {
  id: string;
  path: string;
  name: string;
  type: string;
  language: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface Subgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function extractSubgraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  question: string,
  queryType: QueryType
): Subgraph {
  const filteredNodes = nodes.filter(
    (n) => !n.path.includes("node_modules") && !n.path.startsWith("../")
  );
  const keywords = extractKeywords(question);

  if (queryType === "impact") {
    return extractImpactSubgraph(filteredNodes, edges, keywords);
  }

  if (queryType === "flow") {
    return extractFlowSubgraph(filteredNodes, edges, keywords);
  }

  return extractFileSubgraph(filteredNodes, edges, keywords);
}

function extractKeywords(question: string): string[] {
  const stopWords = new Set([
    "how",
    "does",
    "work",
    "what",
    "is",
    "the",
    "a",
    "an",
    "in",
    "this",
    "that",
    "it",
    "me",
    "through",
    "explain",
    "tell",
    "about",
    "would",
    "break",
    "if",
    "change",
    "depends",
    "on",
  ]);

  const words = question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const domainExpansions: Record<string, string[]> = {
    auth: [
      "auth",
      "login",
      "session",
      "passport",
      "token",
      "jwt",
      "cookie",
      "user",
      "middleware",
      "authenticate",
      "authorization",
    ],
    authentication: [
      "auth",
      "login",
      "session",
      "token",
      "jwt",
      "cookie",
      "user",
      "middleware",
      "authenticate",
    ],
    routing: ["router", "route", "routes", "middleware", "handler", "endpoint"],
    database: ["db", "database", "prisma", "repository", "model", "schema", "query", "migration"],
    queue: ["queue", "worker", "job", "bull", "bullmq", "processor", "task"],
    error: ["error", "exception", "handler", "middleware", "catch"],
    request: ["request", "route", "middleware", "handler", "controller", "service"],
  };

  const expanded = new Set<string>(words);
  for (const word of words) {
    const expansions = domainExpansions[word];
    if (expansions) {
      for (const e of expansions) expanded.add(e);
    }
  }

  return Array.from(expanded);
}

function scoreNode(node: GraphNode, keywords: string[]): number {
  const path = node.path.toLowerCase();
  return keywords.reduce((score, kw) => (path.includes(kw) ? score + 1 : score), 0);
}

function getFallbackNodes(
  nodes: GraphNode[],
  edges: GraphEdge[],
  count: number
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const degree: Record<string, number> = {};
  for (const edge of edges) {
    degree[edge.source] = (degree[edge.source] ?? 0) + 1;
    degree[edge.target] = (degree[edge.target] ?? 0) + 1;
  }
  const topNodes = [...nodes]
    .sort((a, b) => (degree[b.id] ?? 0) - (degree[a.id] ?? 0))
    .slice(0, count);
  const topIds = new Set(topNodes.map((n) => n.id));
  const topEdges = edges.filter((e) => topIds.has(e.source) && topIds.has(e.target)).slice(0, 40);
  return { nodes: topNodes, edges: topEdges };
}

function extractFlowSubgraph(nodes: GraphNode[], edges: GraphEdge[], keywords: string[]): Subgraph {
  const scored = nodes
    .map((n) => ({ node: n, score: scoreNode(n, keywords) }))
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15)
    .map((n) => n.node);

  if (scored.length === 0) {
    return getFallbackNodes(nodes, edges, 20);
  }

  const seedIds = new Set(scored.map((n) => n.id));
  const expanded = new Set<string>(seedIds);

  for (const edge of edges) {
    if (seedIds.has(edge.source)) expanded.add(edge.target);
    if (seedIds.has(edge.target)) expanded.add(edge.source);
  }

  const subNodes = nodes.filter((n) => expanded.has(n.id)).slice(0, 30);
  const subNodeIds = new Set(subNodes.map((n) => n.id));
  const subEdges = edges.filter((e) => subNodeIds.has(e.source) && subNodeIds.has(e.target));

  return { nodes: topologicalSort(subNodes, subEdges), edges: subEdges };
}

function extractFileSubgraph(nodes: GraphNode[], edges: GraphEdge[], keywords: string[]): Subgraph {
  const scored = nodes
    .map((n) => ({ node: n, score: scoreNode(n, keywords) }))
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((n) => n.node);

  if (scored.length === 0) {
    return getFallbackNodes(nodes, edges, 15);
  }

  const seedIds = new Set(scored.map((n) => n.id));
  const subEdges = edges.filter((e) => seedIds.has(e.source) && seedIds.has(e.target));

  return { nodes: scored, edges: subEdges };
}

function extractImpactSubgraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  keywords: string[]
): Subgraph {
  const scored = nodes
    .map((n) => ({ node: n, score: scoreNode(n, keywords) }))
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((n) => n.node);

  if (scored.length === 0) {
    return getFallbackNodes(nodes, edges, 15);
  }

  const seedIds = new Set(scored.map((n) => n.id));
  const affected = new Set<string>(seedIds);

  for (const edge of edges) {
    if (seedIds.has(edge.target)) affected.add(edge.source);
  }

  const subNodes = nodes.filter((n) => affected.has(n.id)).slice(0, 30);
  const subNodeIds = new Set(subNodes.map((n) => n.id));
  const subEdges = edges.filter((e) => subNodeIds.has(e.source) && subNodeIds.has(e.target));

  return { nodes: subNodes, edges: subEdges };
}

function topologicalSort(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const inDegree: Record<string, number> = {};
  for (const node of nodes) inDegree[node.id] = 0;
  for (const edge of edges) {
    const current = inDegree[edge.target];
    if (current !== undefined) {
      inDegree[edge.target] = current + 1;
    }
  }
  return [...nodes].sort((a, b) => (inDegree[a.id] ?? 0) - (inDegree[b.id] ?? 0));
}

export function assembleContext(
  nodes: GraphNode[],
  edges: GraphEdge[],
  question: string,
  repoName: string
): string {
  const fileList = nodes
    .map((n, i) => `${i + 1}. ${n.path}${n.language ? ` (${n.language})` : ""}`)
    .join("\n");

  const edgeList = edges
    .slice(0, 50)
    .map((e) => `- ${e.source} → ${e.target}`)
    .join("\n");

  return `Repository: ${repoName}
Question: ${question}

Relevant files (${nodes.length} files, in reading order):
${fileList}

Dependencies:
${edgeList || "No direct dependencies between these files."}`;
}
