import { Suspense } from "react";
import { Loader } from "../../../components/ui/Loader";
import MagicLinkVerifyClient from "../../../components/auth/MagicLinkVerify";

export default function MagicLinkVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader size="lg" text="Verifying magic link..." />
        </main>
      }
    >
      <MagicLinkVerifyClient />
    </Suspense>
  );
}
