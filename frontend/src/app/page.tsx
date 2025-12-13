import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect(`/m/${process.env.NEXT_PUBLIC_VENUE_SLUG}`);
}
