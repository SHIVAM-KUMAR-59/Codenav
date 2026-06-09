import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader } from "./Loader";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",

  secondary: "bg-secondary text-secondary-foreground hover:bg-accent",

  outline: "border border-primary/10 bg-transparent text-foreground hover:bg-accent",

  ghost: "bg-transparent text-foreground hover:bg-accent",
};

export const Button = ({
  children,
  loading = false,
  loadingText,
  leftIcon,
  rightIcon,
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2
        rounded-xl px-4 py-3
        text-sm font-medium
        cursor-pointer
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:active:scale-100
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader direction="row" size="sm" text={loadingText} />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
};
