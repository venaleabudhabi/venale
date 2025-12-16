import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'REVIVE Admin - Orders & Menu Management',
  description: 'Restaurant management and order processing',
  manifest: '/manifest-admin.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'REVIVE Admin',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#059669',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
