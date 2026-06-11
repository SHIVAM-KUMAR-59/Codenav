"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { repositoryApi } from "../lib/api/repository";

export const useRepository = () => {
  const fetchRepositoriesQuery = useQuery({
    queryKey: ["repositories"],
    queryFn: repositoryApi.getRepositories,
  });

  const analyzeRepositoryMutation = useMutation({
    mutationFn: (url: string) => repositoryApi.analyze(url),
  });

  return {
    fetchRepositoriesQuery,
    analyzeRepositoryMutation,
  };
};
