import { ErrorState } from "../ui/ErrorState";
import { GitBranch } from "lucide-react";
import Link from "next/link";
import RepositoryRow from "./RepositoryRow";
import RepositoryRowSkeleton from "./RepositoryRowSkeleton";
import { Button } from "../ui/Button";
import { Repository } from "client/lib/types";

type RepositoryListProps = {
  repositories: Repository[];
  loading: boolean;
  error?: Error | null;
  onRetry?: () => void;
};

const RepositoryList = ({ repositories, loading, error, onRetry }: RepositoryListProps) => {
  return (
    <section className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold">Recent repositories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a repository to view its architecture graph, modules, and analysis output.
        </p>
      </div>

      {loading ? (
        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, index) => (
            <RepositoryRowSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load repositories"
          description="We couldn't fetch your repositories. Please try again."
          action={
            onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Try Again
              </Button>
            )
          }
        />
      ) : repositories.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
            <GitBranch className="h-7 w-7 text-muted-foreground" />
          </div>

          <h3 className="text-xl font-semibold">No repositories analyzed yet</h3>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Paste a GitHub repository URL to generate architecture maps, learning paths, and flow
            analysis.
          </p>

          <Link
            href="/dashboard/new"
            className="mt-6 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Analyze your first repository
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {repositories.map((repo) => (
            <RepositoryRow key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RepositoryList;
