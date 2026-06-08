import { Mail, ArrowLeft } from "lucide-react";

type MagicLinkSentProps = {
  email: string;
  onBack: () => void;
};

export const MagicLinkSent = ({ email, onBack }: MagicLinkSentProps) => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-secondary">
          <Mail className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold text-primary">Check your inbox</h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We've sent a secure sign-in link to
        </p>

        <p className="mt-1 break-all text-sm font-medium text-primary">{email}</p>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Click the link in the email to sign in. The link will expire after a short period for
          security reasons.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground transition-all hover:bg-accent"
          >
            <ArrowLeft size={16} />
            Use a different email
          </button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Didn't receive it? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    </div>
  );
};
