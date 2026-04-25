import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sublabel,
  className,
  valueClassName,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={cn("rounded-lg border bg-card p-5", className)}>
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className={cn("text-2xl font-semibold mt-2", valueClassName)}>
        {value}
      </div>
      {sublabel && (
        <div className="text-xs text-muted-foreground mt-1">{sublabel}</div>
      )}
    </div>
  );
}
