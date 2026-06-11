import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export const ErrorState = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again later.",
  action,
}: ErrorStateProps) => {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>

      <h3 className="text-xl font-semibold text-primary">{title}</h3>

      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
