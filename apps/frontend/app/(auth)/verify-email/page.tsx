"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";


const CheckCircleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    <circle cx="12" cy="12" r="10" className="check-circle-ring" />
    <polyline points="7 12.5 10.5 16 17 9" className="check-circle-mark" />
  </svg>
);

const SpinnerIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    className="h-full w-full animate-spin"
  >
    <circle cx="12" cy="12" r="10" strokeOpacity={0.2} />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

const XCircleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-full w-full"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6M9 9l6 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);


type Status = "loading" | "success" | "error";

const STATUS_CONFIG: Record<
  Status,
  {
    icon: React.ReactNode;
    iconWrapClass: string;
    glowClass: string;
    heading: string;
    subtext: string;
    badgeLabel: string;
    badgeClass: string;
  }
> = {
  loading: {
    icon: <SpinnerIcon />,
    iconWrapClass: "text-sky-400",
    glowClass: "bg-sky-500/15",
    heading: "Verifying your email…",
    subtext: "Hang tight — this only takes a moment.",
    badgeLabel: "In progress",
    badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  },
  success: {
    icon: <CheckCircleIcon />,
    iconWrapClass: "text-emerald-400",
    glowClass: "bg-emerald-500/15",
    heading: "Email verified!",
    subtext: "Your account is confirmed. Redirecting you to sign in…",
    badgeLabel: "Verified",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  error: {
    icon: <XCircleIcon />,
    iconWrapClass: "text-rose-400",
    glowClass: "bg-rose-500/15",
    heading: "Verification failed",
    subtext: "The link may be invalid or expired. Request a new one below.",
    badgeLabel: "Failed",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  },
};


const steps = ["Create account", "Verify email", "Get started"];

const StepTrail = ({ status }: { status: Status }) => {
  const activeStep = status === "success" ? 2 : 1;
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold transition-all duration-500
                  ${
                    done
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400"
                      : active
                        ? "border-sky-500/60 bg-sky-500/15 text-sky-400 shadow-[0_0_12px_--theme(--color-sky-500/0.3)]"
                        : "border-zinc-700 bg-zinc-800/60 text-zinc-600"
                  }`}
              >
                {done ? (
                  <svg
                    viewBox="0 0 10 10"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                  >
                    <polyline points="2 5 4.2 7.5 8 2.5" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-[9px] font-medium tracking-wide uppercase transition-colors duration-500 ${
                  done
                    ? "text-emerald-500/70"
                    : active
                      ? "text-sky-400"
                      : "text-zinc-600"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1.5 mb-4 h-px w-10 transition-all duration-700 ${
                  done ? "bg-emerald-500/40" : "bg-zinc-700/60"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`,
          { method: "POST" },
        );
        if (!res.ok) throw new Error();
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };
    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status !== "success") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push("/home");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status, router]);

  const cfg = STATUS_CONFIG[status];

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 flex flex-col items-center justify-center px-4 py-12">

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

      <Card className="w-full max-w-120 z-10 animate-fade-in">

        <div className="flex justify-center mb-8">
          <StepTrail status={status} />
        </div>

        <div className="mb-6 flex flex-col items-center gap-4">

          <div className="relative flex items-center justify-center">
            <div
              className={`absolute h-24 w-24 rounded-full blur-2xl ${cfg.glowClass} transition-all duration-700`}
            />
            <div
              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-zinc-900 shadow-xl ${cfg.iconWrapClass} transition-all duration-500`}
            >
              <div className="h-8 w-8">{cfg.icon}</div>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase ${cfg.badgeClass} transition-all duration-500`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${status === "loading" ? "animate-pulse bg-sky-400" : status === "success" ? "bg-emerald-400" : "bg-rose-400"}`}
            />
            {cfg.badgeLabel}
          </span>
        </div>

        <div className=" text-center">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-100">
            {cfg.heading}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {cfg.subtext}
          </p>
        </div>

        {status === "success" && (
          <div className="space-y-3">
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-600">
                <span>Redirecting automatically</span>
                <span className="tabular-nums text-emerald-500">
                  {countdown}s
                </span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              fullWidth
              className="group mb-2 flex items-center justify-center gap-2 py-3 text-sm font-medium tracking-widest uppercase"
              onClick={() => router.push("/signin")}
            >
              Continue to sign in
              <ArrowRightIcon />
            </Button>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-2">
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-zinc-600 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-600">
              Please do not close this tab
            </p>
          </div>
        )}
      </Card>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.45s cubic-bezier(.22,1,.36,1) both;
        }

        /* SVG check circle animation */
        .check-circle-ring {
          stroke-dasharray: 63;
          stroke-dashoffset: 63;
          animation: draw-ring 0.55s 0.1s cubic-bezier(.22,1,.36,1) forwards;
        }
        .check-circle-mark {
          stroke-dasharray: 20;
          stroke-dashoffset: 20;
          animation: draw-mark 0.35s 0.55s cubic-bezier(.22,1,.36,1) forwards;
        }
        @keyframes draw-ring {
          to { stroke-dashoffset: 0; }
        }
        @keyframes draw-mark {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </main>
  );
}
