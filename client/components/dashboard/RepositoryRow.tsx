import { AlertCircle, CheckCircle2, Clock3, GitBranch } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Repository } from "client/lib/types";

const statusStyles: Record<string, string> = {
  PENDING: "border-slate-500/20 bg-slate-500/10 text-slate-400",
  QUEUED: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  CLONING: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  COMPLETED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-400",
};

type RepositoryRowProps = {
  repo: Repository;
};

const RepositoryRow = ({ repo }: RepositoryRowProps) => {
  const latestAnalysis = repo.analyses?.[0];

  const status = latestAnalysis?.status ?? "PENDING";

  const lastAnalyzed = latestAnalysis?.createdAt
    ? new Date(latestAnalysis.createdAt).toLocaleString()
    : "Not analyzed yet";
  return (
    <div className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-secondary/40 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary">
          <GitBranch className="h-5 w-5 text-primary" />
        </div>

        <div>
          <h3 className="font-semibold text-primary">{repo.name}</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {repo.owner} • {repo.defaultBranch} • {repo.latestCommitSha.slice(0, 7)}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 size={14} />
            Last analyzed: {lastAnalyzed}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${
            statusStyles[status]
          }`}
        >
          {status === "COMPLETED" && <CheckCircle2 size={13} />}
          {status === "ANALYZING" && <Clock3 size={13} />}
          {status === "FAILED" && <AlertCircle size={13} />}
          {status}
        </span>

        <Link href={`/repositories/${repo.id}`}>
          <Button variant="outline">Open</Button>
        </Link>
      </div>
    </div>
  );
};

export default RepositoryRow;
