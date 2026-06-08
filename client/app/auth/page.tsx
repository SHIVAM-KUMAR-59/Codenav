"use client";

import { MagicLinkSent } from "client/components/auth/MagicLinkSent";
import { Button } from "client/components/ui/Button";
import { useToast } from "client/context/ToastContext";
import { useAuth } from "client/hooks/use-auth";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";

const AuthPage = () => {
  const [email, setEmail] = useState<string>("");
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);
  const { success, error } = useToast();

  const { sendMagicLinkMutation } = useAuth();

  const emailLoading = sendMagicLinkMutation.isPending;
  const loading = emailLoading;

  const handleSubmitEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await sendMagicLinkMutation.mutateAsync(email);
      success("Magic link sent. Please check your email.");
      setMagicLinkSent(true);
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to send magic link.");
    }
  };

  const handleGithubClick = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/github`;
  };

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border bg-secondary/60 px-6 py-4 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-primary">
            Codenav
          </Link>

          <p className="hidden text-sm text-muted-foreground sm:block">
            Repository intelligence for contributors
          </p>
        </nav>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-12">
        {magicLinkSent ? (
          <MagicLinkSent email={email} onBack={() => setMagicLinkSent(false)} />
        ) : (
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/20">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-secondary">
                <span className="text-lg font-semibold text-primary">CN</span>
              </div>

              <h1 className="text-2xl font-semibold text-primary">
                Understand any repository in minutes
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Paste a repository, explore its architecture, trace flows, and get guided
                contribution paths.
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleSubmitEmail}>
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-primary">
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
                />
              </div>

              <Button
                type="submit"
                loading={emailLoading}
                loadingText="Sending you the link..."
                rightIcon={<ArrowRight size={18} />}
              >
                Continue with Email
              </Button>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button
                variant="outline"
                onClick={handleGithubClick}
                disabled={loading}
                rightIcon={
                  <Image
                    src="/github.svg"
                    alt="Github icon"
                    width={18}
                    height={18}
                    className="invert"
                  />
                }
              >
                Continue with GitHub
              </Button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
};

export default AuthPage;
