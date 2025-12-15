import { DirhamSymbol } from '@/components/DirhamSymbol';

interface DirhamAmountProps {
  amount: number;
  showDecimals?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  bold?: boolean;
  className?: string;
  showSymbolBefore?: boolean;
  strikethrough?: boolean;
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export default function DirhamAmount({
  amount,
  showDecimals = true,
  size = 'md',
  bold = false,
  className = '',
  showSymbolBefore = true,
  strikethrough = false,
}: DirhamAmountProps) {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });

  const textClasses = `${sizeClasses[size]} ${bold ? 'font-bold' : ''} ${
    strikethrough ? 'line-through' : ''
  } ${className}`;

  return (
    <span className={`inline-flex items-center gap-1 ${textClasses}`}>
      {showSymbolBefore && <DirhamSymbol />}
      <span>{formatted}</span>
      {!showSymbolBefore && <DirhamSymbol />}
    </span>
  );
}
