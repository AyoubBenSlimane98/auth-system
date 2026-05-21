"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightElement?: ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, rightElement, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-xs font-medium tracking-widest uppercase text-zinc-500"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            name={props.name ?? id}
            className={`
              w-full rounded-lg
              bg-white/4 border border-white/10
              text-zinc-100 placeholder:text-zinc-600
              text-sm px-4 py-3
              transition-all duration-200
              focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.07]
              focus:shadow-[0_0_0_3px_rgba(251,191,36,0.1)]
              ${rightElement ? "pr-11" : ""}
              ${error ? "border-red-500/50 focus:border-red-400/50 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" : ""}
              ${className}
            `}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
