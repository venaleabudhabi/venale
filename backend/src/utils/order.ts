import Order from '../models/Order';
import Counter from '../models/Counter';

/**
 * Generate unique order number with atomic counter
 * Format: VENXREV-XXX-DDMMYYYY
 * Thread-safe and prevents race conditions
 */
export const generateOrderNumber = async (): Promise<string> => {
  const date = new Date();
  
  // Format: DDMMYYYY
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getFullYear()}`;
  
  const counterId = `order-${dateStr}`;
  
  // Atomic increment using findOneAndUpdate
  // This is thread-safe and prevents race conditions
  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { 
      $inc: { seq: 1 },
      $setOnInsert: { date: dateStr }
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );

  // Format: VENXREV-001-13122025
  const orderNum = counter.seq.toString().padStart(3, '0');
  return `VENXREV-${orderNum}-${dateStr}`;
};

export const calculateTotals = (
  items: any[],
  venue: any,
  isMember: boolean = false
): { subtotal: number; vat: number; discount: number; deliveryFee: number; total: number } => {
  // Calculate subtotal (item price + addon prices) * quantity
  const subtotal = items.reduce((sum, item) => {
    const addonTotal = item.selectedAddons?.reduce((a: number, addon: any) => a + (addon.price || 0), 0) || 0;
    return sum + (item.price + addonTotal) * item.qty;
  }, 0);

  // Apply member discount
  const discountPercent = isMember ? venue.member_discount_percent : 0;
  const discount = (subtotal * discountPercent) / 100;

  const afterDiscount = subtotal - discount;

  // Calculate VAT
  const vat = (afterDiscount * venue.vatPercent) / 100;

  // Delivery fee (if applicable, will be set by caller)
  const deliveryFee = 0;

  const total = afterDiscount + vat + deliveryFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};
