interface DirhamSymbolProps {
  size?: number;
  className?: string;
}

export function DirhamSymbol({ size = 16, className = '' }: DirhamSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M8 9.5h8v1H8v-1zm0 2h8v1H8v-1zm0 2h8v1H8v-1z"/>
      <path d="M14.5 7c1.93 0 3.5 1.57 3.5 3.5v3c0 1.93-1.57 3.5-3.5 3.5H9.5C7.57 17 6 15.43 6 13.5v-3C6 8.57 7.57 7 9.5 7h5m0 1.5h-5c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2z"/>
    </svg>
  );
}

// Simplified version - just the symbol without circle
export function DirhamSymbolSimple({ size = 16, className = '' }: DirhamSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 640 512"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M438.6 160.5c50.3 0 91.3 41 91.3 91.3v96c0 50.3-41 91.3-91.3 91.3H224v-37.5h214.6c30.2 0 54.8-24.6 54.8-54.8v-96c0-30.2-24.6-54.8-54.8-54.8H224v-35.5h214.6zM96 32h32v192h288V32h32v192h96v32h-96v32h96v32h-96v160h-32V288H128v160H96V288H0v-32h96v-32H0v-32h96V32zm32 192V96h288v128H128z"/>
    </svg>
  );
}
