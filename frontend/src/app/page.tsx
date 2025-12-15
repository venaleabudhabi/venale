import { redirect } from 'next/navigation';

export default function HomePage() {
  const slug = process.env.NEXT_PUBLIC_VENUE_SLUG || 'revive-refuel-venale';
  redirect(`/m/${slug}`);
}
