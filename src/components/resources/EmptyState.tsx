import { FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon || <FileText className="h-16 w-16 mb-4 text-muted-foreground" />}
      <p className="text-muted-foreground mb-2 text-center font-medium">{title}</p>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </div>
  );
}
