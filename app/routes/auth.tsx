import type { Route } from "./+types/auth";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AI Resume Screener | Auth" },
    { name: "description", content: "Log into your account" },
  ];
}

export default function Auth() {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const next = useMemo(() => {
    const raw = new URLSearchParams(location.search).get("next") || "/";
    return raw.startsWith("/") ? raw : "/";
  }, [location.search]);

  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate(next, { replace: true });
    }
  }, [auth.isAuthenticated, next, navigate]);

  const handleSignIn = async () => {
    setClicked(true);
    await auth.signIn();
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="gradient-border p-1 rounded-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <h2 className="text-gray-600">Log In To Continue Your Job Journey</h2>
          </div>

          <div>
            {isLoading && clicked ? (
              <button className="auth-button animate-pulse" disabled>
                Signing you in...
              </button>
            ) : auth.isAuthenticated ? (
              <button className="auth-button" onClick={auth.signOut}>
                Sign Out
              </button>
            ) : (
              <button className="auth-button" onClick={handleSignIn}>
                Sign In
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
