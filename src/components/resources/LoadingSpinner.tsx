import { Sparkles } from 'lucide-react';
import { Spinner } from '@/components/ui/native-spinner';

interface LoadingSpinnerProps {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ title, subtitle, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4 native-fade-in">
      <div className="relative">
        <Spinner size={size} />
        <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-base font-semibold">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
