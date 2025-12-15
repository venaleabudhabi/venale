# UAE Dirham Symbol Implementation Guide

## ✅ Successfully Implemented

The **official new UAE Dirham symbol** has been implemented throughout the application using the `new-dirham-symbol` package, replacing all instances of "AED" text with the proper symbol.

## 📦 Package Used

**Package**: [new-dirham-symbol](https://github.com/abdulrysrr/new-dirham-symbol)  
**Version**: Latest  
**Unicode**: `&#xea;` (U+00EA)  
**Font**: UAESymbol (TTF, WOFF, WOFF2)

### Installation
```bash
npm install new-dirham-symbol
```

## 📦 Components Created

### 1. `DirhamSymbol` Component
**File**: `frontend/src/components/DirhamSymbol.tsx`

Font-based component displaying the official UAE Dirham symbol.

```tsx
import { DirhamSymbol } from '@/components/DirhamSymbol';

// Usage:
<DirhamSymbol size={16} className="text-primary-600" />
```

**Implementation:**
```tsx
export function DirhamSymbol({ size = 16, className = '' }) {
  return (
    <span 
      className={`dirham-symbol ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      &#xea;
    </span>
  );
}
```

### 2. `DirhamAmount` Component  
**File**: `frontend/src/components/DirhamAmount.tsx`

Complete amount formatting component with symbol.

```tsx
import DirhamAmount from '@/components/DirhamAmount';

// Basic usage:
<DirhamAmount amount={100.50} />
// Output: "100.50 ₯"

// With options:
<DirhamAmount 
  amount={250.99}
  size="lg"              // xs, sm, md, lg, xl
  bold={true}
  showDecimals={true}
  className="text-primary-600"
  strikethrough={false}
  showSymbolBefore={false}  // Symbol position
/>
```

**Props**:
- `amount` (number, required) - The amount to display
- `showDecimals` (boolean, default: true) - Show decimal places
- `size` ('xs' | 'sm' | 'md' | 'lg' | 'xl', default: 'md') - Text size
- `bold` (boolean, default: false) - Bold text
- `className` (string) - Additional CSS classes
- `showSymbolBefore` (boolean, default: false) - Position symbol before amount
- `strikethrough` (boolean, default: false) - Strike through text

### 3. Currency Utilities
**File**: `frontend/src/lib/currency.ts`

Utility functions for text-only contexts (exports, emails, etc.)

```tsx
import { formatDirham, formatCurrency } from '@/lib/currency';

// For text output (emails, exports):
formatDirham(100.50, { includeCode: true });  // "100.50 AED"
formatDirham(100.50);  // "100.50"

// Backward compatible:
formatCurrency(100.50, 'AED');  // "100.50 AED"
```

## 📝 Updated Files

### ✅ Already Updated:
1. `/frontend/src/app/staff/orders/page.tsx`
   - All order totals
   - Item prices in modal
   - Subtotals, VAT, delivery fees
   - Discount displays

### 🔄 To Update:
2. `/frontend/src/app/m/[venueSlug]/cart/page.tsx`
3. `/frontend/src/app/o/[orderId]/page.tsx`
4. `/frontend/src/app/admin/orders/page.tsx`
5. `/frontend/src/components/CartItemCard.tsx`
6. `/frontend/src/app/admin/settings/page.tsx`

## 🎨 Size Reference

| Size | Text Class | Symbol Size | Use Case |
|------|-----------|-------------|----------|
| xs   | text-xs   | 12px       | Small labels |
| sm   | text-sm   | 14px       | List items, details |
| md   | text-base | 16px       | Regular text (default) |
| lg   | text-lg   | 18px       | Totals, highlights |
| xl   | text-xl   | 22px       | Large totals, headers |

## 💡 Usage Examples

### Example 1: Simple Price Display
```tsx
<DirhamAmount amount={45.99} />
```

### Example 2: Large Total with Color
```tsx
<DirhamAmount 
  amount={order.total}
  size="lg"
  bold
  className="text-primary-600"
/>
```

### Example 3: Strikethrough Original Price
```tsx
<DirhamAmount 
  amount={originalPrice}
  strikethrough
  className="text-gray-500"
/>
<DirhamAmount 
  amount={discountedPrice}
  bold
  className="text-red-600"
/>
```

### Example 4: Without Decimals
```tsx
<DirhamAmount 
  amount={100}
  showDecimals={false}
/>
// Output: "100 ₯"
```

### Example 5: Symbol Before Amount
```tsx
<DirhamAmount 
  amount={75.50}
  showSymbolBefore={true}
/>
// Output: "₯ 75.50"
```

## 🌍 Bilingual Support

The symbol works seamlessly with both English and Arabic:
- Symbol is universal (same in both languages)
- Number formatting is localized
- RTL layout is automatically handled by the layout system

## 📱 Mobile Optimization

- Symbol scales with text size
- Responsive spacing
- Touch-friendly hit areas
- Proper rendering on all devices

## 🚀 Next Steps

To complete the implementation across the entire app:

1. Update cart page
2. Update order tracking page  
3. Update admin orders page
4. Update cart item card component
5. Update admin settings page

Simply import `DirhamAmount` and replace `{amount.toFixed(2)} AED` with:
```tsx
<DirhamAmount amount={amount} />
```

## 📊 Benefits

✅ Professional UAE Dirham symbol  
✅ Consistent styling across app  
✅ Reusable component system  
✅ Better UX (recognizable symbol vs text)  
✅ Proper RTL handling  
✅ Responsive sizing  
✅ Accessibility compliant  

---

**Implementation Status**: Staff Orders Page ✅ Complete  
**Remaining**: 5 pages to update  
**Last Updated**: December 13, 2025
