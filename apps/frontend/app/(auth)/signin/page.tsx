"use client";

import { useCallback, useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const TwitterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4 text-zinc-300"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className="h-4 w-4"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/signin`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Request failed");
      }

      setEmail("");
      setPassword("");

      router.push("/home");
    } catch (error) {
      console.error("Error submitting form", error);
    } finally {
      setLoading(false);
    }
  };
  const handleOAuthLogin = useCallback((provider: string) => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const urls: Record<string, string> = {
      Google: `${API_URL}/auth/google`,
      Twitter: `${API_URL}/auth/twitter`,
    };

    const url = urls[provider];
    if (url) {
      window.location.assign(url);
    }
  }, []);
  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/10 blur-[120px]"
      />

      <Card className="w-full max-w-120 z-10">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 shadow-[0_4px_20px_rgba(251,191,36,0.35)]">
              <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-100">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Please enter your details to sign in.
              </p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            {[
              { label: "Google", Icon: GoogleIcon },
              { label: "Twitter", Icon: TwitterIcon },
            ].map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleOAuthLogin(label)}
                aria-label={`Sign in with ${label}`}
                className="cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/4 py-2.5 text-zinc-400 transition-all duration-150 hover:bg-white/10 hover:border-white/20 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
              >
                <Icon /> Sign in with {label.toLocaleLowerCase()}
              </button>
            ))}
          </div>

          <div className="relative mb-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs font-medium uppercase tracking-widest text-zinc-600">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mb-4 flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email..."
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              rightElement={
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="transition-colors duration-150 hover:text-zinc-300 focus:outline-none"
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500 hover:text-zinc-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-white/20 bg-white/5 accent-amber-400 focus:ring-amber-400"
              />
              Remember me
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-amber-400/80 transition-colors hover:text-amber-300 focus:outline-none focus-visible:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="mb-6 py-3 text-sm tracking-widest uppercase cursor-pointer"
          >
            {loading ? " Sign In..." : " Sign In"}
          </Button>

          <p className="text-center text-sm text-zinc-600">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/signup"
              className="font-medium text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </Card>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.45s cubic-bezier(.22,1,.36,1) both;
        }
      `}</style>
    </main>
  );
}
