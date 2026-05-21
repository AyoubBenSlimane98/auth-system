"use client";

import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components//Button";
import Input from "../../components//Input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );
      const data = (await res.json()) as { message: string };
      if (!res.ok)
        throw new Error(data.message || "Feild to send reset email password");
      setSuccessMessage(data.message);
      localStorage.setItem("email", email);
      setEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

      {successMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in rounded-2xl border border-green-500/20 bg-zinc-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-green-400">Success</h2>

            <p className="mt-2 text-sm text-zinc-300">{successMessage}</p>

            <button
              onClick={() => {
                setSuccessMessage("");
                router.replace("/signin");
              }}
              className="cursor-pointer mt-5 w-full rounded-lg bg-green-500/10 py-2 text-sm text-green-400 hover:bg-green-500/20 transition"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-150 z-10">
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div>
                <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-100">
                  Forgot your password?
                </h1>
                <p className="mt-1 text-sm text-zinc-500">
                  No worries. Enter your email and we&apos;ll send you a reset
                  link right away.
                </p>
              </div>
            </div>

            <div className="mb-4 gap-4">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email..."
                autoComplete="email"
                value={email}
                error={error}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              className="mb-6 py-3 text-sm tracking-widest uppercase "
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </Card>
      )}

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
