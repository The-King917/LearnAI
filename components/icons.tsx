interface CheckIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CheckIcon({ size = 7, strokeWidth = 2.2, className }: CheckIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth={strokeWidth} className={className}>
      <path d="M1 5.5L3.5 8 9 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
