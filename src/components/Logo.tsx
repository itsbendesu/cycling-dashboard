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
      {/* Tire */}
      <circle cx="12" cy="12" r="11" strokeWidth="1" />
      {/* Rim */}
      <circle cx="12" cy="12" r="9" />
      {/* Hub */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      {/* 3 curved spokes — like a racing wheel */}
      <path d="M12 10.5 C10 7, 6.5 5.5, 3.5 7" />
      <path d="M13 10.8 C16.5 9, 19.5 10.5, 20.5 13.5" />
      <path d="M11.5 13.5 C10 16, 8 19, 5 20" />
    </svg>
  );
}
