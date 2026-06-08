import { CodeEdge, CodeNode, EntryPoint, LearningPath } from "./types";

export function generateLearningPaths(
  nodes: CodeNode[],
  edges: CodeEdge[],
  entryPoints: EntryPoint[]
): LearningPath[] {
  const paths: LearningPath[] = [];

  const authPath = buildAuthPath(nodes, edges);
  if (authPath) paths.push(authPath);

  const requestPath = buildRequestLifecyclePath(entryPoints, nodes, edges);
  if (requestPath) paths.push(requestPath);

  const dbPath = buildDatabasePath(nodes, edges);
  if (dbPath) paths.push(dbPath);

  const workerPath = buildWorkerPath(nodes, edges);
  if (workerPath) paths.push(workerPath);

  return paths;
}

function buildAuthPath(nodes: CodeNode[], edges: CodeEdge[]): LearningPath | null {
  const authNodes = nodes.filter((n) => n.path.toLowerCase().includes("auth"));

  if (authNodes.length === 0) return null;

  const sorted = sortByDependency(authNodes, edges);

  return {
    id: "auth-flow",
    title: "Authentication flow",
    description: "How authentication is implemented in this codebase",
    files: sorted.map((node, index) => ({
      order: index + 1,
      path: node.path,
      reason: inferReason(node),
    })),
  };
}

function buildRequestLifecyclePath(
  entryPoints: EntryPoint[],
  nodes: CodeNode[],
  edges: CodeEdge[]
): LearningPath | null {
  const serverEntry = entryPoints.find((e) => e.type === "server");
  if (!serverEntry) return null;

  const reachable = getReachableNodes(serverEntry.path, edges, nodes, 3);
  if (reachable.length === 0) return null;

  return {
    id: "request-lifecycle",
    title: "Request lifecycle",
    description: "How an incoming request is handled from entry to response",
    files: reachable.map((node, index) => ({
      order: index + 1,
      path: node.path,
      reason: inferReason(node),
    })),
  };
}

function buildDatabasePath(nodes: CodeNode[], edges: CodeEdge[]): LearningPath | null {
  const dbNodes = nodes.filter(
    (n) =>
      n.path.toLowerCase().includes("repository") ||
      n.path.toLowerCase().includes("prisma") ||
      n.path.toLowerCase().includes("database") ||
      n.path.toLowerCase().includes("db")
  );

  if (dbNodes.length === 0) return null;

  const sorted = sortByDependency(dbNodes, edges);

  return {
    id: "database-layer",
    title: "Database layer",
    description: "How data is persisted and retrieved",
    files: sorted.map((node, index) => ({
      order: index + 1,
      path: node.path,
      reason: inferReason(node),
    })),
  };
}

function buildWorkerPath(nodes: CodeNode[], edges: CodeEdge[]): LearningPath | null {
  const workerNodes = nodes.filter(
    (n) =>
      n.path.toLowerCase().includes("worker") ||
      n.path.toLowerCase().includes("queue") ||
      n.path.toLowerCase().includes("job")
  );

  if (workerNodes.length === 0) return null;

  const sorted = sortByDependency(workerNodes, edges);

  return {
    id: "worker-queue",
    title: "Worker and queue flow",
    description: "How background jobs are queued and processed",
    files: sorted.map((node, index) => ({
      order: index + 1,
      path: node.path,
      reason: inferReason(node),
    })),
  };
}

function sortByDependency(nodes: CodeNode[], edges: CodeEdge[]): CodeNode[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree: Record<string, number> = {};

  for (const node of nodes) {
    inDegree[node.id] = 0;
  }

  for (const edge of edges) {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      inDegree[edge.target] = (inDegree[edge.target] ?? 0) + 1;
    }
  }

  return [...nodes].sort((a, b) => (inDegree[a.id] ?? 0) - (inDegree[b.id] ?? 0));
}

function getReachableNodes(
  startPath: string,
  edges: CodeEdge[],
  nodes: CodeNode[],
  depth: number
): CodeNode[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const visited = new Set<string>();
  const result: CodeNode[] = [];

  function traverse(currentPath: string, currentDepth: number) {
    if (currentDepth === 0 || visited.has(currentPath)) return;
    visited.add(currentPath);

    const node = nodeMap.get(currentPath);
    if (node) result.push(node);

    const outgoing = edges.filter((e) => e.source === currentPath);
    for (const edge of outgoing) {
      traverse(edge.target, currentDepth - 1);
    }
  }

  traverse(startPath, depth);
  return result;
}

function inferReason(node: CodeNode): string {
  const p = node.path.toLowerCase();
  if (p.includes("route")) return "Defines the API routes for this module";
  if (p.includes("controller")) return "Handles incoming requests and delegates to service";
  if (p.includes("service")) return "Contains the core business logic";
  if (p.includes("repository")) return "Handles all database operations";
  if (p.includes("middleware")) return "Processes requests before they reach the handler";
  if (p.includes("worker")) return "Processes background jobs";
  if (p.includes("queue")) return "Manages job queuing";
  if (p.includes("model") || p.includes("schema")) return "Defines the data model";
  if (p.includes("config")) return "Configuration and setup";
  if (p.includes("util") || p.includes("helper")) return "Utility functions";
  if (p.includes("index")) return "Module entry point and public exports";
  return "Part of this module";
}
