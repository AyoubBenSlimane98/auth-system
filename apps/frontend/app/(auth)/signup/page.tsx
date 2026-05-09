"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Link from "next/link";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}
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

export default function SignUpPage() {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasAgree, setHasAgree] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isFormValid =
    form.firstName &&
    form.lastName &&
    form.email &&
    form.password &&
    form.confirmPassword &&
    hasAgree;
  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!form.firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(form.firstName)) {
      newErrors.firstName = "First name must contain only letters";
    }
    if (!form.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+$/.test(form.firstName)) {
      newErrors.lastName = "Last name must contain only letters";
    }
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(
        form.password,
      )
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, number, and special character";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(form),
          },
        );
        let data: {
          status: boolean;
          message: string;
          data: {
            user_id: string;
            email: string;
            created_at: string;
          };
          meta: {
            method: string;
            path: string;
            timestamp: string;
          };
        };
        try {
          data = await res.json();
        } catch {
          throw new Error("Invalid server response");
        }
        if (!data.status) {
          throw new Error(data.message || "Signup failed");
        }

        localStorage.setItem("email", data.data.email);
        setSuccessMessage(
          `Welcome ${form.firstName}!  Check "${form.email}" for verification link.`,
        );

        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Error submitting form", error);
      } finally {
        setLoading(false);
      }
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

      <Card className="w-full max-w-xl z-10">
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
                Create your account
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Get started — it only takes a minute.
              </p>
            </div>
          </div>

          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-row justify-between gap-4 ">
              <Input
                id="firstName"
                type="text"
                label="FirstName"
                error={
                  errors.firstName && form.firstName ? errors.firstName : ""
                }
                placeholder="Enter your firstName..."
                value={form.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <Input
                id="lastName"
                type="text"
                label="LastName"
                placeholder="Enter your lastName..."
                error={errors.lastName && form.lastName ? errors.lastName : ""}
                value={form.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email..."
              autoComplete="email"
              error={errors.email && form.email ? errors.email : ""}
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="********"
              autoComplete="new-password"
              value={form.password}
              error={errors.password && form.password ? errors.password : ""}
              onChange={(e) => handleChange("password", e.target.value)}
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
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              label="Confirm Password"
              placeholder="********"
              autoComplete="new-password"
              value={form.confirmPassword}
              error={
                errors.confirmPassword && form.confirmPassword
                  ? errors.confirmPassword
                  : ""
              }
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              rightElement={
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="transition-colors duration-150 hover:text-zinc-300 focus:outline-none"
                >
                  <EyeIcon open={showConfirm} />
                </button>
              }
            />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-500 hover:text-zinc-400">
              <input
                type="checkbox"
                checked={hasAgree}
                onChange={(e) => setHasAgree(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer rounded border-white/20 bg-white/5 accent-amber-400 focus:ring-amber-400"
              />
              I agree to the Terms and Conditions and Privacy Policy
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={!isFormValid}
            className="mb-6 py-3 text-sm tracking-widest uppercase"
          >
            {loading ? " Sign Up..." : " Sign Up"}
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
      {successMessage && (
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
                router.push("/signin");
              }}
              className="cursor-pointer mt-5 w-full rounded-lg bg-green-500/10 py-2 text-sm text-green-400 hover:bg-green-500/20 transition"
            >
              Close
            </button>
          </div>
        </div>
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
