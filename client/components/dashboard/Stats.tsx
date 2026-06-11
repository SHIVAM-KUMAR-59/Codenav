import { Repository } from "client/lib/types";
import { Skeleton } from "../ui/Skeleton";

type StatsProps = {
  repositories: Repository[];
  loading: boolean;
};

const Stats = ({ repositories, loading }: StatsProps) => {
  const latestStatuses = repositories.map((repo) => repo.analyses?.[0]?.status);

  const completed = latestStatuses.filter((status) => status === "COMPLETED").length;

  const inProgress = latestStatuses.filter(
    (status) => status === "QUEUED" || status === "CLONING" || status === "PENDING"
  ).length;

  const stats = [
    {
      label: "Total Repositories",
      value: repositories.length,
    },
    {
      label: "Completed",
      value: completed,
    },
    {
      label: "In Progress",
      value: inProgress,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
          {loading ? (
            <>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-8 w-14" />
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <h2 className="mt-2 text-3xl font-semibold">{stat.value}</h2>
            </>
          )}
        </div>
      ))}
    </section>
  );
};

export default Stats;
