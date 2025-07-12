import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "pending" as const;
      case "done":
      case "ok":
        return "ok" as const;
      case "review":
        return "review" as const;
      default:
        return "unknown" as const;
    }
  };

  return (
    <Badge variant={getVariant(status)} className="capitalize">
      {status}
    </Badge>
  );
}