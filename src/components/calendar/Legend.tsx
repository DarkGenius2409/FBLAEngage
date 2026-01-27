export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-primary"></div>
        <span className="text-xs text-muted-foreground">Regional</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-accent"></div>
        <span className="text-xs text-muted-foreground">State</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-[#b93838]"></div>
        <span className="text-xs text-muted-foreground">National</span>
      </div>
    </div>
  );
}
