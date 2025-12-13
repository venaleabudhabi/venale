'use client';

import { useLanguageStore } from './store';

export const translations = {
  en: {
    // Navigation & Common
    menu: 'Menu',
    search: 'Search',
    cart: 'Cart',
    checkout: 'Checkout',
    back: 'Back',
    close: 'Close',
    add: 'Add',
    remove: 'Remove',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Menu & Items
    addToCart: 'Add to Cart',
    viewCart: 'View Cart',
    emptyCart: 'Your cart is empty',
    items: 'items',
    item: 'item',
    ingredients: 'Ingredients',
    nutrition: 'Nutrition',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fat: 'Fat',
    fiber: 'Fiber',
    
    // Order & Pricing
    subtotal: 'Subtotal',
    vat: 'VAT',
    deliveryFee: 'Delivery Fee',
    discount: 'Discount',
    memberDiscount: 'Member Discount',
    total: 'Total',
    
    // Fulfillment
    pickup: 'Pickup',
    delivery: 'Delivery',
    
    // Customer Info
    phone: 'Phone Number',
    name: 'Name',
    email: 'Email',
    address: 'Delivery Address',
    notes: 'Order Notes',
    
    // Payment
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery',
    card: 'Card Payment',
    placeOrder: 'Place Order',
    
    // Order Status
    orderNumber: 'Order Number',
    orderStatus: 'Order Status',
    trackOrder: 'Track Order',
    status: {
      PENDING: 'Pending',
      CONFIRMED: 'Confirmed',
      PREPARING: 'Preparing',
      READY: 'Ready',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
    },
    
    // Tags
    tags: {
      'high-protein': 'High Protein',
      'energy': 'Energy',
      'immunity': 'Immunity',
      'wellness': 'Wellness',
      'recovery': 'Recovery',
      'greens': 'Greens',
      'sleep': 'Sleep',
      'fiber': 'Fiber',
      'antioxidants': 'Antioxidants',
      'seasonal': 'Seasonal',
      'shot': 'Shot',
      'juice': 'Juice',
      'fruit': 'Fruit',
    },
    
    // Categories
    categories: {
      protein_shakes: 'Protein Shake',
      healthy_bowls: 'Healthy Bowls',
      chia_oats_delights: 'Chia & Oats Delights',
      smoothies: 'Smoothies',
      wellness_shots: 'Wellness Shots',
      fruits_cup: 'Fruits Cup',
      fresh_juices: 'Fresh Juices',
    },
    
    // Member Benefits
    memberBenefits: 'Member Benefits',
    memberDiscountNote: 'Exclusive 15% discount for Revive members.',
    loyaltyNote: 'Revive members who visit our shop can get a loyalty card.',
    iAmMember: 'I am a Revive member',
    
    // Admin
    admin: 'Admin',
    login: 'Login',
    logout: 'Logout',
    dashboard: 'Dashboard',
    orders: 'Orders',
    menuManagement: 'Menu Management',
    settings: 'Settings',
    
    // Driver
    driver: 'Driver',
    deliveries: 'Deliveries',
    assigned: 'Assigned',
    startDelivery: 'Start Delivery',
    markDelivered: 'Mark as Delivered',
  },
  ar: {
    // Navigation & Common
    menu: 'القائمة',
    search: 'بحث',
    cart: 'السلة',
    checkout: 'الدفع',
    back: 'رجوع',
    close: 'إغلاق',
    add: 'إضافة',
    remove: 'حذف',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    
    // Menu & Items
    addToCart: 'أضف إلى السلة',
    viewCart: 'عرض السلة',
    emptyCart: 'سلتك فارغة',
    items: 'عناصر',
    item: 'عنصر',
    ingredients: 'المكونات',
    nutrition: 'القيمة الغذائية',
    calories: 'سعرات حرارية',
    protein: 'بروتين',
    carbs: 'كربوهيدرات',
    fat: 'دهون',
    fiber: 'ألياف',
    
    // Order & Pricing
    subtotal: 'المجموع الفرعي',
    vat: 'ضريبة القيمة المضافة',
    deliveryFee: 'رسوم التوصيل',
    discount: 'خصم',
    memberDiscount: 'خصم الأعضاء',
    total: 'الإجمالي',
    
    // Fulfillment
    pickup: 'استلام',
    delivery: 'توصيل',
    
    // Customer Info
    phone: 'رقم الهاتف',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    address: 'عنوان التوصيل',
    notes: 'ملاحظات الطلب',
    
    // Payment
    paymentMethod: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام',
    card: 'الدفع بالبطاقة',
    placeOrder: 'تأكيد الطلب',
    
    // Order Status
    orderNumber: 'رقم الطلب',
    orderStatus: 'حالة الطلب',
    trackOrder: 'تتبع الطلب',
    status: {
      PENDING: 'قيد الانتظار',
      CONFIRMED: 'مؤكد',
      PREPARING: 'قيد التحضير',
      READY: 'جاهز',
      OUT_FOR_DELIVERY: 'في الطريق',
      COMPLETED: 'مكتمل',
      CANCELLED: 'ملغي',
    },
    
    // Tags
    tags: {
      'high-protein': 'عالي البروتين',
      'energy': 'طاقة',
      'immunity': 'مناعة',
      'wellness': 'صحة',
      'recovery': 'تعافي',
      'greens': 'خضار',
      'sleep': 'نوم',
      'fiber': 'ألياف',
      'antioxidants': 'مضادات الأكسدة',
      'seasonal': 'موسمي',
      'shot': 'جرعة',
      'juice': 'عصير',
      'fruit': 'فاكهة',
    },
    
    // Categories
    categories: {
      protein_shakes: 'مشروبات البروتين',
      healthy_bowls: 'أطباق صحية',
      chia_oats_delights: 'تشيا و الشوفان',
      smoothies: 'سموذي',
      wellness_shots: 'جرعات صحية',
      fruits_cup: 'كوب الفواكه',
      fresh_juices: 'عصائر طازجة',
    },
    
    // Member Benefits
    memberBenefits: 'مزايا الأعضاء',
    memberDiscountNote: 'خصم حصري 15٪ لأعضاء ريفايف',
    loyaltyNote: 'يمكن لأعضاء ريفايف الحصول على بطاقة ولاء عند زيارة المتجر',
    iAmMember: 'أنا عضو في ريفايف',
    
    // Admin
    admin: 'الإدارة',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    orders: 'الطلبات',
    menuManagement: 'إدارة القائمة',
    settings: 'الإعدادات',
    
    // Driver
    driver: 'السائق',
    deliveries: 'التوصيلات',
    assigned: 'المسندة',
    startDelivery: 'بدء التوصيل',
    markDelivered: 'تم التوصيل',
  },
};

export type Language = 'en' | 'ar';

export function useTranslation() {
  const { lang } = useLanguageStore();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[lang as Language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };
  
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  return { t, lang, dir };
}
