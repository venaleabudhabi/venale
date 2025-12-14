import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Driver Portal - REVIVE Refuel',
  description: 'Delivery driver portal for REVIVE Refuel',
  manifest: '/driver-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'REVIVE Driver',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
