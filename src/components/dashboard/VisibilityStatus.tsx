import { cn } from "@/lib/utils";

interface VisibilityStatusProps {
  score: number;
  status: string;
  description: string;
  seeing: string;
  transparency: string;
  bortle: string;
}

export function VisibilityStatus({ 
  score, 
  status, 
  description, 
  seeing, 
  transparency, 
  bortle 
}: VisibilityStatusProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 70) return "from-success to-emerald-400";
    if (score >= 40) return "from-warning to-amber-400";
    return "from-destructive to-red-400";
  };

  const getStatusIndicator = (score: number) => {
    if (score >= 70) return "online";
    if (score >= 40) return "away";
    return "offline";
  };

  const getStatusLabel = (score: number) => {
    if (score >= 70) return { text: "Excellent Conditions", color: "text-success" };
    if (score >= 40) return { text: "Fair Conditions", color: "text-warning" };
    return { text: "Poor Conditions", color: "text-destructive" };
  };

  const getLaunchStatus = (score: number) => {
    if (score >= 70) return "Go for Launch";
    if (score >= 40) return "Proceed with Caution";
    return "Recommend Hold";
  };

  const statusLabel = getStatusLabel(score);

  return (
    <div className="glass-card card-glow rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={cn("status-indicator", getStatusIndicator(score))} />
        <span className={cn("text-xs uppercase tracking-wider font-medium", statusLabel.color)}>
          {statusLabel.text}
        </span>
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground mb-2">
        {getLaunchStatus(score)}:
      </h2>
      <h3 className={cn("font-display text-2xl font-bold mb-3", getScoreColor(score))}>
        {status}
      </h3>

      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        {description}
      </p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Visibility Score</span>
          <span className={cn("font-display text-2xl font-bold", getScoreColor(score))}>
            {score}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full bg-gradient-to-r rounded-full transition-all duration-500", getScoreGradient(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">Seeing</span>
          <span className="font-display font-bold text-foreground">{seeing}</span>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">Transp.</span>
          <span className="font-display font-bold text-foreground">{transparency}</span>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">Bortle</span>
          <span className="font-display font-bold text-foreground">{bortle}</span>
        </div>
      </div>
    </div>
  );
}