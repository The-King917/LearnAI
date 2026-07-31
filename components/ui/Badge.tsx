import { cn } from "@/lib/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "accent";
}

const VARIANT: Record<"neutral" | "accent", string> = {
  neutral: "border-border-2 text-text-2 bg-surface",
  accent: "border-accent/30 text-accent bg-accent/10",
};

export default function Badge({ variant = "neutral", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-2xs font-medium", VARIANT[variant], className)}
      {...rest}
    >
      {children}
    </span>
  );
}
