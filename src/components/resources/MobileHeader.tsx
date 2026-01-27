import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({ title, subtitle, onBack, rightAction }: MobileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11"
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex-1 px-2">
        <h2 className="text-lg font-semibold text-center truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground text-center mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {rightAction || <div className="w-11" />}
    </div>
  );
}
