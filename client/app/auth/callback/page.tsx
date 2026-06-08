"use client";

import { Loader } from "../../../components/ui/Loader";
import { useAuth } from "../../../context/AuthContext";
import { authApi } from "../../../lib/api/auth";
import { tokenStore } from "../../../lib/api/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const AuthCallbackPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");

      if (!accessToken) {
        router.replace("/auth?error=missing_token");
        return;
      }

      try {
        tokenStore.set(accessToken);

        const user = await authApi.me();

        setAuth(accessToken, user);

        router.replace("/dashboard");
      } catch {
        tokenStore.set(null);
        router.replace("/auth?error=auth_failed");
      }
    };

    handleCallback();
  }, [router, searchParams, setAuth]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Loader size="lg" text="Signing you in..." />
    </main>
  );
};

export default AuthCallbackPage;
