import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ title, subtitle, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-4">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        <Sparkles className={`${iconSizeClasses[size]} text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold">{title}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
