import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-accent text-background hover:bg-accent-hover font-medium",
  secondary: "border border-border-2 text-text-2 hover:border-border-3 hover:text-text",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 rounded-lg text-sm",
  md: "px-6 py-3 rounded-xl text-sm",
};

const BASE = "inline-flex items-center justify-center transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: React.ReactNode;
}

type ButtonProps = CommonProps &
  ({ href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">));

export default function Button({ variant = "primary", size = "md", className, children, ...rest }: ButtonProps) {
  const classes = cn(BASE, VARIANT[variant], SIZE[size], className);

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorProps } = rest as { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
