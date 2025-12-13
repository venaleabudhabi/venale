'use client';

import { MenuItem } from '@/lib/api';
import { useEffect } from 'react';
import { useLanguageStore } from '@/lib/store';
import { useTranslation } from '@/lib/i18n';

interface NutritionModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NutritionModal({ item, isOpen, onClose }: NutritionModalProps) {
  const { lang } = useLanguageStore();
  const { t } = useTranslation(lang);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !item?.nutrition) {
    return null;
  }

  const nutrition = item.nutrition;
  const macros = [
    { label: t('calories'), value: nutrition.calories_kcal, unit: 'kcal', color: 'from-orange-400 to-orange-600' },
    { label: t('protein'), value: nutrition.protein_g, unit: 'g', color: 'from-red-400 to-red-600' },
    { label: t('carbs'), value: nutrition.carbs_g, unit: 'g', color: 'from-blue-400 to-blue-600' },
    { label: t('fat'), value: nutrition.fat_g, unit: 'g', color: 'from-yellow-400 to-yellow-600' },
    { label: t('fiber'), value: nutrition.fiber_g, unit: 'g', color: 'from-primary-500 to-primary-700' }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white sticky top-0">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                <p className="text-white text-opacity-80 text-sm">{lang === 'ar' ? 'المعلومات الغذائية' : 'Nutritional Information'}</p>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors">
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-800">{lang === 'ar' ? 'المغذيات الكبرى' : 'Macronutrients'}</h3>
              <div className="space-y-3">
                {macros.map((macro) => (
                  <div key={macro.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{macro.label}</span>
                      <span className="text-lg font-bold text-primary-600">
                        {macro.value?.toFixed(1)} {macro.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${macro.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {nutrition.micros && nutrition.micros.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">{lang === 'ar' ? 'المغذيات الدقيقة الرئيسية' : 'Key Micronutrients'}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {nutrition.micros.map((micro) => (
                    <div key={micro} className="bg-primary-50 rounded-lg p-3 border border-primary-200">
                      <p className="text-sm font-medium text-primary-700">{micro}</p>
                      <p className="text-xs text-primary-600 mt-1">{lang === 'ar' ? 'مصدر جيد' : 'Good source'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">{t('ingredients')}</h3>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient) => (
                    <span key={ingredient} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-primary-100 border border-primary-300 rounded-lg p-4">
              <p className="text-sm text-primary-900">
                <span className="font-semibold">✓ {lang === 'ar' ? 'خيار رائع!' : 'Great choice!'}</span>{' '}
                {lang === 'ar' 
                  ? `هذا المنتج غني بـ${nutrition.protein_g && nutrition.protein_g > 30 ? ' البروتين' : ''}${nutrition.fiber_g && nutrition.fiber_g > 5 ? ' الألياف' : ''}${nutrition.carbs_g && nutrition.carbs_g < 30 ? ' قليل الكربوهيدرات' : ''} لأسلوب حياة صحي.`
                  : `This item is rich in${nutrition.protein_g && nutrition.protein_g > 30 ? ' protein' : ''}${nutrition.fiber_g && nutrition.fiber_g > 5 ? ' fiber' : ''}${nutrition.carbs_g && nutrition.carbs_g < 30 ? ' low carbs' : ''} for a healthy lifestyle.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
