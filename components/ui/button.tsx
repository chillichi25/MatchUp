import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants = {
  primary:
    "bg-[#00B83F] text-white hover:bg-green-700",

  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200",

  outline:
    "border border-gray-300 bg-white hover:bg-gray-50",

  danger:
    "bg-red-600 text-white hover:bg-red-700",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-2xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}