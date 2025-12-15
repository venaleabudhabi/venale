interface DirhamSymbolProps {
  className?: string;
}

// UAE Dirham Symbol Component
// Using the official new UAE Dirham symbol font
// Per UAE Central Bank regulation: symbol must be same size as price
export function DirhamSymbol({ className = '' }: DirhamSymbolProps) {
  return (
    <span 
      className={`dirham-symbol ${className}`}
      aria-label="AED"
    >
      &#xea;
    </span>
  );
}


