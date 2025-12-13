import { DirhamSymbol } from '@/components/DirhamSymbol';

// UAE Dirham currency utilities

export const DIRHAM_CODE = 'AED';

/**
 * Format amount with Dirham symbol as React element
 * Use DirhamAmount component for React components
 * This is for utility functions that need string output
 */
export const formatDirham = (
  amount: number,
  options?: {
    showDecimals?: boolean;
    includeCode?: boolean;
  }
): string => {
  const { showDecimals = true, includeCode = false } = options || {};
  
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  
  // Return with AED code for text-only contexts (emails, exports, etc.)
  if (includeCode) {
    return `${formatted} ${DIRHAM_CODE}`;
  }
  
  // For UI, use the DirhamAmount component instead
  return formatted;
};

/**
 * Format currency with proper symbol (backward compatibility)
 */
export const formatCurrency = (amount: number, currency: string = 'AED'): string => {
  if (currency === 'AED') {
    return formatDirham(amount, { includeCode: true });
  }
  return `${amount.toFixed(2)} ${currency}`;
};
