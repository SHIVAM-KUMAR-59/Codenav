import { Skeleton } from "../ui/Skeleton";

const RepositoryRowSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <Skeleton className="h-11 w-11 rounded-xl" />

        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-80 max-w-full" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
};

export default RepositoryRowSkeleton;
