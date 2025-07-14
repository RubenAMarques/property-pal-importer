import { Check, X } from "lucide-react";
import { parseQuality } from "@/utils/getQuality";

interface QualityChecklistProps {
  scoreJson: any;
}

export function QualityChecklist({ scoreJson }: QualityChecklistProps) {
  if (!scoreJson) {
    return <div className="text-muted-foreground text-sm">No quality data available</div>;
  }

  const parsedQuality = parseQuality(scoreJson);
  
  const checks = [
    { key: 'photosDivisionsOk', label: 'Photos Divisions', value: parsedQuality.photosDivisionsOk },
    { key: 'noDuplicatesOk', label: 'No Duplicates', value: parsedQuality.noDuplicatesOk },
    { key: 'photo_quality', label: 'Photo Quality', value: parsedQuality.photo_quality },
    { key: 'location_ok', label: 'Location OK', value: parsedQuality.location_ok },
    { key: 'description_ok', label: 'Description OK', value: parsedQuality.description_ok },
    { key: 'base_info_ok', label: 'Base Info OK', value: parsedQuality.base_info_ok }
  ];

  const passedChecks = checks.filter(check => check.value === true).length;
  const totalChecks = checks.length;

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold">
        Overall {passedChecks} / {totalChecks}
      </div>
      <ul className="space-y-2">
        {checks.map((check) => {
          const passed = check.value;
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