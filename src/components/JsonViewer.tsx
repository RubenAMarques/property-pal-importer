import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JsonViewerProps {
  data: any;
  defaultExpanded?: boolean;
}

export function JsonViewer({ data, defaultExpanded = false }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!data) {
    return <div className="text-muted-foreground text-sm">No data</div>;
  }

  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="border rounded-lg overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-2 h-auto"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 mr-2" />
        ) : (
          <ChevronRight className="h-4 w-4 mr-2" />
        )}
        Score JSON {expanded ? "(click to collapse)" : "(click to expand)"}
      </Button>
      
      {expanded && (
        <div className="p-4 bg-muted/30 border-t">
          <pre className="text-sm overflow-auto max-h-96 text-foreground">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
}