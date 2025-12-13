export const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED',
] as const;

export const PAYMENT_METHODS = ['COD', 'CARD'] as const;

export const FULFILLMENT_TYPES = ['PICKUP', 'DELIVERY'] as const;

export const USER_ROLES = ['admin', 'manager', 'staff', 'driver'] as const;

export const CHANNELS = ['QR', 'WEB'] as const;

export const LANGUAGES = ['en', 'ar'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type Channel = (typeof CHANNELS)[number];
export type Language = (typeof LANGUAGES)[number];
