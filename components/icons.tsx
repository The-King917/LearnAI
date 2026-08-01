interface CheckIconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CheckIcon({ size = 7, strokeWidth = 2.2, className }: CheckIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="#F7F4EE" strokeWidth={strokeWidth} className={className}>
      <path d="M1 5.5L3.5 8 9 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CellIconProps {
  size?: number;
  className?: string;
}

export function CellCheckIcon({ size = 20, className }: CellIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="9.5" fill="rgba(34,197,94,0.1)" stroke="rgba(34,197,94,0.3)" />
      <path d="M5.5 10.5L8 13L14.5 7" stroke="#4ade80" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CellCrossIcon({ size = 20, className }: CellIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="9.5" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.15)" />
      <path d="M7 7L13 13M13 7L7 13" stroke="#ef4444" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CellPartialIcon({ size = 20, className }: CellIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="9.5" fill="rgba(234,179,8,0.08)" stroke="rgba(234,179,8,0.25)" />
      <path d="M6 10H14" stroke="#facc15" strokeOpacity="0.7" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
