interface TagBadgeProps {
  tag: string;
  className?: string;
}

export default function TagBadge({ tag, className = '' }: TagBadgeProps) {
  const tagStyles: Record<string, string> = {
    'high-protein': 'bg-blue-100 text-blue-800',
    energy: 'bg-yellow-100 text-yellow-800',
    immunity: 'bg-green-100 text-green-800',
    recovery: 'bg-purple-100 text-purple-800',
    sleep: 'bg-indigo-100 text-indigo-800',
    greens: 'bg-emerald-100 text-emerald-800',
    antioxidants: 'bg-pink-100 text-pink-800',
    wellness: 'bg-teal-100 text-teal-800',
    fiber: 'bg-orange-100 text-orange-800',
    shot: 'bg-red-100 text-red-800',
    fruit: 'bg-lime-100 text-lime-800',
    juice: 'bg-cyan-100 text-cyan-800',
    seasonal: 'bg-amber-100 text-amber-800',
  };

  const style = tagStyles[tag] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${style} ${className}`}>
      {tag.replace(/-/g, ' ')}
    </span>
  );
}
