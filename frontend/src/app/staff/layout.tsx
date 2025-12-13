import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Orders - REVIVE',
  description: 'Order management for REVIVE staff',
  manifest: '/staff-manifest.json',
  themeColor: '#4e2430',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'REVIVE Staff',
  },
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
