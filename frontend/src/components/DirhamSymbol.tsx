interface DirhamSymbolProps {
  size?: number;
  className?: string;
}

// Size mapping for standard sizes
const sizeClasses: Record<number, string> = {
  12: 'dirham-symbol-xs',
  14: 'dirham-symbol-sm',
  16: 'dirham-symbol-md',
  18: 'dirham-symbol-lg',
  22: 'dirham-symbol-xl',
};

// UAE Dirham Symbol Component
// Using the official new UAE Dirham symbol font
export function DirhamSymbol({ size = 16, className = '' }: DirhamSymbolProps) {
  const sizeClass = sizeClasses[size] || 'dirham-symbol-md';
  
  return (
    <span 
      className={`dirham-symbol ${sizeClass} ${className}`}
      aria-label="AED"
    >
      &#xea;
    </span>
  );
}


