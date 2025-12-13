interface NutritionBadgeProps {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  micros?: string[];
  className?: string;
}

export default function NutritionBadge({
  calories,
  protein,
  carbs,
  fat,
  fiber,
  micros,
  className = '',
}: NutritionBadgeProps) {
  if (!calories && !protein && !carbs) return null;

  return (
    <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
      <h4 className="text-xs font-semibold text-gray-700 mb-2">Nutrition per serving</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {calories && (
          <div>
            <span className="text-gray-600">Calories:</span>{' '}
            <span className="font-medium">{calories} kcal</span>
          </div>
        )}
        {protein && (
          <div>
            <span className="text-gray-600">Protein:</span>{' '}
            <span className="font-medium">{protein}g</span>
          </div>
        )}
        {carbs && (
          <div>
            <span className="text-gray-600">Carbs:</span>{' '}
            <span className="font-medium">{carbs}g</span>
          </div>
        )}
        {fat && (
          <div>
            <span className="text-gray-600">Fat:</span>{' '}
            <span className="font-medium">{fat}g</span>
          </div>
        )}
        {fiber && (
          <div>
            <span className="text-gray-600">Fiber:</span>{' '}
            <span className="font-medium">{fiber}g</span>
          </div>
        )}
      </div>
      {micros && micros.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Rich in:</span> {micros.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
