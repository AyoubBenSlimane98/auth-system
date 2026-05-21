"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-gradient-to-br from-zinc-100 to-zinc-300 text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.4)] hover:from-white hover:to-zinc-200 active:scale-[0.98] py-3 px-6 text-sm tracking-wide",
    ghost:
      "bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.97] py-2.5 px-4 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
