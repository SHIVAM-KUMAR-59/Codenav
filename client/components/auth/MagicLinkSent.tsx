import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";

type MagicLinkSentProps = {
  email: string;
  onBack: () => void;
};

export const MagicLinkSent = ({ email, onBack }: MagicLinkSentProps) => {
  return (
    <div className="w-full max-w-md rounded-2xl border border-green-950 bg-card p-6 shadow-2xl shadow-black/20">
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
          Click the link in email to sign in. The link will expire after <b>15 mins</b> for security
          reasons.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3">
          <Button onClick={onBack} variant="secondary" leftIcon={<ArrowLeft size={16} />}>
            Use a different email
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Didn't receive it? Check your spam folder or try again in a few minutes.
        </p>
      </div>
    </div>
  );
};
