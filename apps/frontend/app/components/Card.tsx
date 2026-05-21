"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-white/3 backdrop-blur-2xl
        border border-white/10
        rounded-2xl p-10
        shadow-[0_32px_64px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]
        animate-fade-in
        ${className}
      `}
    >
      {/* Inner glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-white/6 to-transparent" />
      {children}
    </div>
  );
}
