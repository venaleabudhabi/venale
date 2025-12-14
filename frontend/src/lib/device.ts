/**
 * Device Detection Utilities
 */

export const isAppleDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod|macintosh/.test(userAgent) && 'ontouchend' in document;
};

export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

export const isMobileDevice = (): boolean => {
  return isAppleDevice() || isAndroidDevice();
};

export const isApplePayAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if Apple Pay is available on this device
  return isAppleDevice() && (window as any).ApplePaySession?.canMakePayments();
};

export const isGooglePayAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Google Pay works on Android devices and Chrome on desktop
  return isAndroidDevice() || /chrome/.test(window.navigator.userAgent.toLowerCase());
};
