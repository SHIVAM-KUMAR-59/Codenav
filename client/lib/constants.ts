export const SSE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Queued",
  FETCHING_METADATA: "Fetching metadata",
  QUEUED: "Job queued",
  CLONING: "Cloning repository",
  DETECTING_LANGUAGES: "Detecting languages",
  BUILDING_FOLDER_MAP: "Building folder map",
  BUILDING_DEPENDENCY_GRAPH: "Building dependency graph",
  GENERATING_LEARNING_PATHS: "Generating learning paths",
  SAVING_RESULTS: "Saving results",
  COMPLETED: "Analysis complete",
  FAILED: "Analysis failed",
};

export const SSE_STEPS = [
  "CLONING",
  "DETECTING_LANGUAGES",
  "BUILDING_FOLDER_MAP",
  "BUILDING_DEPENDENCY_GRAPH",
  "GENERATING_LEARNING_PATHS",
  "SAVING_RESULTS",
  "COMPLETED",
];
