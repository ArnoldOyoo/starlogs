import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: "default" | "primary" | "success" | "warning";
  iconColor?: string;
}

export function WeatherCard({ 
  icon: Icon, 
  label, 
  value, 
  subValue, 
  subValueColor = "default",
  iconColor = "text-primary"
}: WeatherCardProps) {
  const subValueColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
  };

  return (
    <div className="glass-card rounded-xl p-4 flex flex-col group hover:scale-[1.02] transition-transform duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="font-display text-2xl font-bold text-foreground">
        {value}
      </div>
      {subValue && (
        <span className={cn("text-xs mt-1", subValueColors[subValueColor])}>
          {subValue}
        </span>
      )}
    </div>
  );
}
