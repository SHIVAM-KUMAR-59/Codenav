"use client";

import { Loader } from "../ui/Loader";
import { useAuth as useAuthActions } from "../../hooks/use-auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { tokenStore } from "../../lib/api/axios";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type VerifyState = "verifying" | "success" | "error";

export default function MagicLinkVerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasVerified = useRef(false);

  const [state, setState] = useState<VerifyState>("verifying");
  const [message, setMessage] = useState("Verifying your magic link...");

  const { verifyMagicLinkMutation } = useAuthActions();
  const { setAuth } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyToken = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setState("error");
        setMessage("Magic link token is missing.");
        toast.error("Invalid magic link.");
        return;
      }

      try {
        const result = await verifyMagicLinkMutation.mutateAsync(token);

        tokenStore.set(result.accessToken);
        setAuth(result.accessToken, result.user);

        setState("success");
        setMessage("Magic link verified successfully.");
        toast.success("Signed in successfully.");

        setTimeout(() => {
          router.replace("/dashboard");
        }, 1200);
      } catch (error) {
        tokenStore.set(null);

        setState("error");
        setMessage(
          error instanceof Error ? error.message : "This magic link is invalid or has expired."
        );

        toast.error("Magic link verification failed.");
      }
    };

    verifyToken();
  }, [router, searchParams, setAuth, toast, verifyMagicLinkMutation]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-2xl shadow-black/20">
        {state === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Loader size="lg" text="Verifying magic link..." />
            <p className="text-sm text-muted-foreground">
              Please wait while we securely sign you in.
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>

            <h1 className="text-2xl font-semibold text-primary">You&apos;re signed in</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              {message} Redirecting you to your dashboard...
            </p>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>

            <h1 className="text-2xl font-semibold text-primary">Invalid magic link</h1>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>

            <Link
              href="/auth"
              className="mt-6 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
