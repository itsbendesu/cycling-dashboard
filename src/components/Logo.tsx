export function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Wheel rim */}
      <circle cx="12" cy="12" r="10" />
      {/* Hub */}
      <circle cx="12" cy="12" r="2" />
      {/* Spokes */}
      <line x1="12" y1="2" x2="12" y2="10" />
      <line x1="12" y1="14" x2="12" y2="22" />
      <line x1="2" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="10.59" y2="10.59" />
      <line x1="13.41" y1="13.41" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="13.41" y2="10.59" />
      <line x1="10.59" y1="13.41" x2="4.93" y2="19.07" />
    </svg>
  );
}
