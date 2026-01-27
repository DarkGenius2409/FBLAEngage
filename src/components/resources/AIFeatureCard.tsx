import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles, MessageSquare } from 'lucide-react';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badges: string[];
  onClick: () => void;
  iconBgColor?: 'primary' | 'accent';
}

export function AIFeatureCard({ 
  title, 
  description, 
  icon, 
  badges, 
  onClick,
  iconBgColor = 'primary'
}: AIFeatureCardProps) {
  const bgColorClass = iconBgColor === 'primary' ? 'bg-primary' : 'bg-accent';
  const textColorClass = iconBgColor === 'primary' ? 'text-primary-foreground' : 'text-accent-foreground';

  return (
    <Card
      className="p-4 cursor-pointer active:scale-[0.98] transition-transform touch-manipulation hover:bg-muted/50"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className={`${bgColorClass} p-3 rounded-lg flex-shrink-0 ${textColorClass}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {badges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
}
