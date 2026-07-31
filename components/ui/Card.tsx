import { cn } from "@/lib/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  accentGlow?: boolean;
  hoverable?: boolean;
  radius?: "xl" | "2xl";
  /** Border-color utility, e.g. "border-accent". Defaults to the standard card border. */
  border?: string;
  /** Background utility, e.g. "bg-surface-2". Defaults to the standard card surface. */
  bg?: string;
}

const RADIUS: Record<"xl" | "2xl", string> = {
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

// `border`/`bg` are explicit props (not folded into `className`) because Tailwind can't
// guarantee a later conflicting utility (e.g. bg-surface-2) beats the base bg-surface via
// class order alone — same-specificity utilities are ordered by the compiled stylesheet,
// not by className string position.
export default function Card({
  elevated = true,
  accentGlow = false,
  hoverable = false,
  radius = "2xl",
  border = "border-border",
  bg = "bg-surface",
  className,
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "border overflow-hidden",
        border,
        bg,
        RADIUS[radius],
        accentGlow ? "shadow-card-accent" : elevated ? "shadow-card" : "",
        hoverable && "hover:border-border-3 transition-colors duration-300",
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}
