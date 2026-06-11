"use client";

import { useQuery } from "@tanstack/react-query";
import { analysisApi } from "../lib/api/analysis";

export const useAnalysis = (id: string) => {
  const fetchAnalysisQuery = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => analysisApi.getAnalysis(id),
    enabled: !!id,
  });

  return { fetchAnalysisQuery };
};
