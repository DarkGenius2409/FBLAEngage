import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink } from 'lucide-react';
import { MobileHeader } from './MobileHeader';
import type { ResourceWithCategory } from '@/lib/models';

interface ResourceDetailViewProps {
  resource: ResourceWithCategory;
  onBack: () => void;
  onDownload: () => void;
}

export function ResourceDetailView({ resource, onBack, onDownload }: ResourceDetailViewProps) {
  const includedItems = {
    pdf: [
      'Comprehensive study guide with key concepts',
      'Practice problems with detailed solutions',
      'Tips and strategies from past winners',
      'Quick reference charts and formulas',
    ],
    video: [
      'Step-by-step video tutorials',
      'Real-world examples and case studies',
      'Expert explanations and demonstrations',
      'Downloadable resources and materials',
    ],
    link: [
      'Access to comprehensive online course',
      'Interactive learning modules',
      'Progress tracking and assessments',
      'Certificate of completion',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <MobileHeader title="Resource Details" onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          <div>
            <Badge className="mb-3 text-xs">{resource.type.toUpperCase()}</Badge>
            <h2 className="text-2xl font-bold mb-2">{resource.title}</h2>
            <p className="text-sm text-muted-foreground">
              {resource.downloads?.toLocaleString() || 0} downloads
            </p>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-base">About this resource</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {resource.description || 'No description available.'}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-xl">
              <h4 className="font-semibold mb-3 text-base">What's included:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {(includedItems[resource.type] || includedItems.pdf).map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {resource.event_name && (
              <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                <h4 className="font-semibold mb-2 text-sm">FBLA Event: {resource.event_name}</h4>
                {resource.category && (
                  <p className="text-xs text-muted-foreground">{resource.category.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background p-4 space-y-2">
        <Button
          className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
          onClick={onDownload}
        >
          <Download className="h-5 w-5 mr-2" />
          {resource.type === 'link' ? 'Open Link' : 'Download'}
        </Button>
        {resource.type === 'link' && resource.url && (
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={() => window.open(resource.url!, '_blank')}
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Open in New Tab
          </Button>
        )}
      </div>
    </div>
  );
}
