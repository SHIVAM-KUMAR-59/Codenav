"use client";

import Header from "client/components/dashboard/Header";
import RepositoryList from "client/components/dashboard/RepositoryList";
import Stats from "client/components/dashboard/Stats";
import { useRepository } from "client/hooks/use-repository";

const DashboardPage = () => {
  const { fetchRepositoriesQuery } = useRepository();

  const repositories = fetchRepositoriesQuery.data ?? [];
  const loading = fetchRepositoriesQuery.isLoading;
  console.log(repositories);
  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <Header />

        <Stats repositories={repositories} loading={loading} />

        <RepositoryList
          repositories={repositories}
          loading={loading}
          error={fetchRepositoriesQuery.error}
          onRetry={() => fetchRepositoriesQuery.refetch()}
        />
      </div>
    </main>
  );
};

export default DashboardPage;
