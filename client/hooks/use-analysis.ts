"use client";

import { analysisApi } from "../lib/api/analysis";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useAnalysis = (id: string) => {
  const fetchAnalysisQuery = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => analysisApi.getAnalysis(id),
    enabled: !!id,
  });

  const queryAnalysisMutation = useMutation({
    mutationFn: (question: string) => analysisApi.queryAnalysis(id, question),
  });

  return { fetchAnalysisQuery, queryAnalysisMutation };
};
