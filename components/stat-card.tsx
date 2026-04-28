import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sublabel,
  className,
  valueClassName,
  compact,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
  valueClassName?: string;
  compact?: boolean;
}) {
  return (
    <div className={cn("rounded-lg border bg-card", compact ? "p-3" : "p-5", className)}>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className={cn(compact ? "text-xl font-semibold mt-1" : "text-2xl font-semibold mt-2", valueClassName)}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>
      )}
    </div>
  );
}
