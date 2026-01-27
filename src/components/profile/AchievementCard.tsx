interface AchievementCardProps {
  icon: string;
  title: string;
  event: string;
}

export function AchievementCard({ icon, title, event }: AchievementCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-muted-foreground">{event}</p>
      </div>
    </div>
  );
}
