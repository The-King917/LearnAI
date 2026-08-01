import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent text-background hover:bg-accent-hover font-medium shadow-button-primary hover:shadow-button-primary-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-button-primary",
  secondary:
    "border border-border-2 text-text-2 hover:border-border-3 hover:text-text hover:bg-surface hover:-translate-y-0.5 active:translate-y-0",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 rounded-full text-sm",
  md: "px-6 py-3 rounded-full text-sm",
};

const BASE =
  "inline-flex items-center justify-center transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none";

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
