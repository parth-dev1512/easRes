import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-black text-white font-[900] uppercase tracking-widest text-sm px-10 h-16 hover:bg-slate-800 transition-all",
  secondary:
    "bg-white border-4 border-black font-[900] uppercase tracking-widest text-sm px-10 h-16 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all",
  icon: "h-16 w-16 bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all",
};

type BlueprintButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function BlueprintButton({
  variant = "primary",
  className,
  ...props
}: BlueprintButtonProps) {
  return (
    <button
      className={clsx(
        "flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
