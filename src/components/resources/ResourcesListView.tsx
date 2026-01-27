import { MobileHeader } from './MobileHeader';
import { SearchBar } from './SearchBar';
import { ResourceCard } from './ResourceCard';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { Loader2, FileText } from 'lucide-react';
import type { ResourceWithCategory } from '@/lib/models';
import type { FBLAEvent } from '@/lib/fblaEvents';

interface ResourcesListViewProps {
  eventName: string;
  event?: FBLAEvent;
  resources: ResourceWithCategory[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  onResourceClick: (resource: ResourceWithCategory) => void;
}

export function ResourcesListView({
  eventName,
  event,
  resources,
  loading,
  searchQuery,
  onSearchChange,
  onBack,
  onResourceClick,
}: ResourcesListViewProps) {
  const filteredResources = resources.filter(resource => {
    if (searchQuery) {
      return resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (resource.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col fullscreen-safe">
      <div className="safe-area-top">
        <MobileHeader
          title={eventName}
          subtitle={event ? `${event.category} • Grades ${event.eligibleGrades}` : undefined}
          onBack={onBack}
        />
      </div>

      <div className="px-4 pt-4 pb-2 border-b border-border bg-background">
        <SearchBar
          placeholder="Search resources..."
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 momentum-scroll">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-16 w-16 mb-4 text-muted-foreground" />}
            title="No resources found"
            description={searchQuery ? 'Try a different search term' : 'Resources will appear here when added'}
          />
        ) : (
          <div className="space-y-3">
            {filteredResources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => onResourceClick(resource)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
