interface BrandIconProps {
  size?: number;
}

export function BrandIcon({ size = 16 }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M140 120 H340 C362 120 380 138 380 160 V280" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M140 120 V352 C140 374 158 392 180 392 H280" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="190" cy="190" r="18" fill="currentColor"/>
      <line x1="240" y1="190" x2="320" y2="190" stroke="currentColor" strokeWidth="28" strokeLinecap="round"/>
      <circle cx="190" cy="260" r="18" fill="currentColor"/>
      <line x1="240" y1="260" x2="295" y2="260" stroke="currentColor" strokeWidth="28" strokeLinecap="round"/>
      <circle cx="190" cy="330" r="18" fill="currentColor"/>
      <line x1="240" y1="330" x2="268" y2="330" stroke="currentColor" strokeWidth="28" strokeLinecap="round"/>
      <circle cx="330" cy="330" r="80" stroke="currentColor" strokeWidth="28"/>
      <line x1="330" y1="330" x2="330" y2="285" stroke="currentColor" strokeWidth="28" strokeLinecap="round"/>
      <line x1="330" y1="330" x2="370" y2="360" stroke="currentColor" strokeWidth="28" strokeLinecap="round"/>
    </svg>
  );
}
