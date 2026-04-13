interface Props {
  size?: number;
}

export function LogoMark({ size = 24 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ascending bars */}
      <rect x="5" y="20" width="6" height="9" rx="1.5" fill="#14532d" opacity="0.6" />
      <rect x="13" y="15" width="6" height="14" rx="1.5" fill="#166534" />
      <rect x="21" y="9" width="6" height="20" rx="1.5" fill="#22c55e" />

      {/* Trend line */}
      <polyline points="8,18 16,13 24,7" fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />

      {/* Top dot */}
      <circle cx="24" cy="7" r="2.2" fill="#171717" opacity="0.7" />
    </svg>
  );
}
