import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "outline";
}

export default function PrimaryButton({
  children,
  isLoading = false,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: PrimaryButtonProps) {
  const baseClasses =
    "w-full py-3 rounded-md font-semibold text-sm text-center transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  const variantClasses =
    variant === "primary"
      ? "bg-brand-primary text-white hover:bg-[#4a43e5] active:scale-[0.98]"
      : "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
