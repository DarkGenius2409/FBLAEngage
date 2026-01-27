import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronRight } from 'lucide-react';
import type { ResourceWithCategory } from '@/lib/models';

interface ResourceCardProps {
  resource: ResourceWithCategory;
  onClick: () => void;
}

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer active:scale-[0.98] transition-transform touch-manipulation hover:bg-muted/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 text-base leading-tight">{resource.title}</h3>
          {resource.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
              {resource.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">{resource.type.toUpperCase()}</Badge>
            {resource.downloads !== undefined && (
              <span className="text-xs text-muted-foreground">
                {resource.downloads.toLocaleString()} downloads
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
}
