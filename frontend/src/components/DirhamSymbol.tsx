interface DirhamSymbolProps {
  size?: number;
  className?: string;
}

// UAE Dirham Symbol Component
// Using SVG representation of the official UAE Dirham currency symbol
export function DirhamSymbol({ size = 16, className = '' }: DirhamSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      aria-label="AED"
    >
      {/* UAE Dirham Symbol - Stylized representation */}
      <path d="M20,30 L80,30 M20,45 L80,45 M20,60 L80,60 M35,20 L35,70 M65,20 L65,70 M30,75 Q35,80 50,80 Q65,80 70,75" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"/>
    </svg>
  );
}

