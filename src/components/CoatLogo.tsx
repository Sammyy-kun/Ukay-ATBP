
export function CoatLogo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-['var(--font-playfair)'] italic font-black tracking-tight text-neutral-900 ${className}`}
      style={{ fontFamily: "var(--font-playfair)", fontStyle: "italic", fontWeight: 900 }}
    >
      coat
    </span>
  );
}
