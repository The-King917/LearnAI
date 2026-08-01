interface LogomarkProps {
  size?: number;
  className?: string;
}

export default function Logomark({ size = 28, className }: LogomarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="8" fill="#1F3B73" />
      <text x="16" y="21.5" textAnchor="middle" fontFamily="'Source Serif 4', Georgia, serif" fontSize="16" fill="#F7F4EE">
        P
      </text>
    </svg>
  );
}
