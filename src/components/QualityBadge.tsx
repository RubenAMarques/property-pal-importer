import { Badge } from "@/components/ui/badge";

interface QualityBadgeProps {
  quality: string;
}

export function QualityBadge({ quality }: QualityBadgeProps) {
  const getVariant = (quality: string) => {
    switch (quality) {
      case "ok":
        return "ok" as const;
      case "review":
        return "review" as const;
      case "unknown":
        return "unknown" as const;
      default:
        return "unknown" as const;
    }
  };

  return (
    <Badge variant={getVariant(quality)} className="capitalize">
      {quality}
    </Badge>
  );
}