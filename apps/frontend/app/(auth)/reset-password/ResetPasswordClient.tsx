"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";

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
interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}
interface Props {
  token: string;
}
export default function ResetPasswordClient({ token }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    const newErrors: FormErrors = {};

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!token) {
      setError("Missing reset token");
      return;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return;

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password: form.confirmPassword,
          }),
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.message || "Request failed");
        throw new Error(data?.code || "ERROR");
      }

      setSuccess(true);
      setForm({ password: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      {success ? (
        <Card className="w-full max-w-md text-center">
          <h1 className="text-xl font-semibold text-white">
            Password reset successful 🎉
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            You can now sign in with your new password.
          </p>
          <Button
            variant="ghost"
            fullWidth
            className="mt-4 py-2 text-sm tracking-widest uppercase cursor-pointer "
            onClick={() => router.replace("/signin")}
          >
            close
          </Button>
        </Card>
      ) : (
        <Card className="w-full max-w-140">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-white">
              Reset your password
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Enter a new password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              value={form.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              rightElement={
                <button
                  type="button"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="transition-colors duration-150 hover:text-zinc-300 focus:outline-none"
                >
                  <EyeIcon open={showPassword} />
                </button>
              }
            />

            <Button type="submit" fullWidth disabled={loading} className="mt-2">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
            {<p className="text-center text-red-500">{error}</p>}
          </form>
        </Card>
      )}
    </main>
  );
}
