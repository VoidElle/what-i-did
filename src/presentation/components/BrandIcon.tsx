interface BrandIconProps {
  size?: number;
}

export function BrandIcon({ size = 16 }: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="5" height="1.5" rx="0.75" fill="currentColor" opacity="0.9" />
      <rect x="2" y="7.25" width="8" height="1.5" rx="0.75" fill="currentColor" opacity="0.65" />
      <rect x="2" y="10.5" width="6" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" />
      <circle cx="12.5" cy="4.75" r="1.75" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
