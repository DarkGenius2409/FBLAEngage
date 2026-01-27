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
    <div 
      className="flex-shrink-0 bg-primary text-primary-foreground border-b border-primary-foreground/10"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-2">
        {/* Back button - fixed width */}
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 text-primary-foreground hover:bg-white/10 flex-shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {/* Centered title - flex grow with text-center */}
        <div className="flex-1 min-w-0 text-center px-2">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          {subtitle && (
            <p className="text-xs text-primary-foreground/70 truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Right action - fixed width to balance */}
        <div className="w-11 flex-shrink-0 flex items-center justify-center">
          {rightAction}
        </div>
      </div>
    </div>
  );
}
