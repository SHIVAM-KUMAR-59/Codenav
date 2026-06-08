type LoaderProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  text?: string;
  direction?: "row" | "col";
  className?: string;
};

const spinnerSizes = {
  xs: "h-4 w-4 border",
  sm: "h-6 w-6 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
  xl: "h-16 w-16 border-4",
};

const textSizes = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export const Loader = ({ size = "md", text, direction = "col", className = "" }: LoaderProps) => {
  return (
    <div
      className={`flex items-center justify-center ${
        direction === "row" ? "flex-row gap-3" : "flex-col gap-3"
      } ${className}`}
    >
      {text && <p className={`${textSizes[size]}`}>{text}</p>}
      <div className="relative shrink-0">
        <div className={`rounded-full border-muted ${spinnerSizes[size]}`} />

        <div
          className={`absolute inset-0 animate-spin rounded-full border-transparent border-t-primary ${spinnerSizes[size]}`}
        />
      </div>
    </div>
  );
};
