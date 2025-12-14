import Order from '../models/Order';

export const generateOrderNumber = async (): Promise<string> => {
  const date = new Date();
  
  // Format: DDMMYYYY
  const dateStr = `${date.getDate().toString().padStart(2, '0')}${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}${date.getFullYear()}`;
  
  // Get start and end of today (midnight to midnight)
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  
  // Count today's orders only (resets at midnight)
  const count = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // Format: VENXREV-001-13122025
  const orderNum = (count + 1).toString().padStart(3, '0');
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
