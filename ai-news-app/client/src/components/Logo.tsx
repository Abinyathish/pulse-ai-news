export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-label="Pulse AI News"
        className="shrink-0"
      >
        {/* Neural network node pattern */}
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <circle cx="16" cy="9" r="2.5" fill="currentColor" className="text-primary" />
        <circle cx="9" cy="20" r="2.5" fill="currentColor" className="text-primary" />
        <circle cx="23" cy="20" r="2.5" fill="currentColor" className="text-primary" />
        <line x1="16" y1="11.5" x2="10.5" y2="18" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <line x1="16" y1="11.5" x2="21.5" y2="18" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
        <line x1="11.5" y1="20" x2="20.5" y2="20" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
      </svg>
      <span className="text-base font-semibold tracking-tight" data-testid="text-logo">
        Pulse AI
      </span>
    </div>
  );
}
