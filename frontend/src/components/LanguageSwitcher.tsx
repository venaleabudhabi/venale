'use client';

import { useLanguageStore } from '@/lib/store';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang } = useLanguageStore();

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === 'en'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          lang === 'ar'
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        aria-label="Switch to Arabic"
      >
        عربي
      </button>
    </div>
  );
}
