"use client";

import { useQuery } from "@tanstack/react-query";
import { repositoryApi } from "../lib/api/repository";

export const useRepository = () => {
  const fetchRepositoriesQuery = useQuery({
    queryKey: ["repositories"],
    queryFn: repositoryApi.fetchAll,
  });

  return {
    fetchRepositoriesQuery,
  };
};
