import { Suspense } from "react";
import AuthCallbackClient from "../../../components/auth/AuthCallback";
import { Loader } from "../../../components/ui/Loader";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <Loader size="lg" text="Signing you in..." />
        </main>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
