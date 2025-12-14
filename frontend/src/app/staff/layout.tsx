import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Staff Orders - REVIVE',
  description: 'Order management for REVIVE staff',
  manifest: '/staff-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'REVIVE Staff',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  themeColor: '#4e2430',
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
