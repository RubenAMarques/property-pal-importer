import { Check, X } from "lucide-react";

interface QualityChecklistProps {
  scoreJson: any;
}

export function QualityChecklist({ scoreJson }: QualityChecklistProps) {
  if (!scoreJson) {
    return <div className="text-muted-foreground text-sm">No quality data available</div>;
  }

  const checks = [
    { key: 'photos_divisions', label: 'Photos Divisions' },
    { key: 'duplicates', label: 'No Duplicates' },
    { key: 'photo_quality', label: 'Photo Quality' },
    { key: 'location_ok', label: 'Location OK' },
    { key: 'description_ok', label: 'Description OK' },
    { key: 'base_info_ok', label: 'Base Info OK' }
  ];

  const passedChecks = checks.filter(check => scoreJson[check.key] === true).length;
  const totalChecks = checks.length;

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">
        Overall {passedChecks} / {totalChecks}
      </div>
      <ul className="space-y-2">
        {checks.map((check) => {
          const passed = scoreJson[check.key] === true;
          return (
            <li key={check.key} className="flex items-center gap-3">
              {passed ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${passed ? 'text-green-700' : 'text-red-700'}`}>
                {check.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}