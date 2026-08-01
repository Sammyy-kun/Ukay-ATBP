
export function CoatLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-['var(--font-poppins)'] font-bold tracking-tight text-neutral-900 ${className}`}
      style={{ fontFamily: "var(--font-poppins)", fontWeight: 700 }}
    >
      sn4g
    </span>
  );
}
