import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoonPhaseCardProps {
  phase: string;
  illumination: number;
  riseTime: string;
  setTime?: string;
  nextPhase?: string;
  nextPhaseDate?: string;
}

function getMoonPhaseAngle(phase: string): number {
  const phases: Record<string, number> = {
    "New Moon": 0,
    "Waxing Crescent": 45,
    "First Quarter": 90,
    "Waxing Gibbous": 135,
    "Full Moon": 180,
    "Waning Gibbous": 225,
    "Last Quarter": 270,
    "Third Quarter": 270,
    "Waning Crescent": 315,
  };
  return phases[phase] ?? 0;
}

export function MoonPhaseCard({ phase, illumination, riseTime, setTime, nextPhase, nextPhaseDate }: MoonPhaseCardProps) {
  const phaseAngle = getMoonPhaseAngle(phase);
  const isWaxing = phaseAngle <= 180;
  const shadowPercent = Math.abs(((phaseAngle % 180) / 180) * 100 - (phaseAngle > 90 && phaseAngle < 270 ? 0 : 100));

  return (
    <div className="glass-card card-glow rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
      {/* Subtle star particles */}
      <div className="absolute inset-0 opacity-30">
        <Sparkles className="absolute top-2 right-8 w-2 h-2 text-primary/50 animate-pulse" />
        <Sparkles className="absolute bottom-3 right-4 w-1.5 h-1.5 text-primary/40 animate-pulse delay-300" />
        <Sparkles className="absolute top-4 right-20 w-1 h-1 text-primary/30 animate-pulse delay-700" />
      </div>

      <div className="flex-1 z-10">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Moon Phase
        </span>
        <h4 className="font-display text-lg font-bold text-foreground mt-1">
          {phase}
        </h4>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
            {illumination}% Lit
          </span>
          <span>Rise: {riseTime}</span>
        </div>
      </div>

      {/* Enhanced Moon Visualization with Tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative w-16 h-16 z-10 cursor-pointer">
              {/* Outer glow */}
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-40"
                style={{
                  background: `radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)`,
                }}
              />
              
              {/* Moon base with realistic gradient */}
              <div 
                className="relative w-full h-full rounded-full overflow-hidden transition-transform hover:scale-110"
                style={{
                  background: `radial-gradient(circle at 30% 30%, #f5f5f0 0%, #e8e8e0 30%, #c9c9c0 60%, #a0a098 100%)`,
                  boxShadow: `
                    inset -2px -2px 6px rgba(0,0,0,0.2),
                    inset 2px 2px 6px rgba(255,255,255,0.3),
                    0 0 20px hsl(var(--primary) / 0.2)
                  `,
                }}
              >
                {/* Crater details */}
                <div 
                  className="absolute w-3 h-3 rounded-full opacity-20"
                  style={{ 
                    background: 'radial-gradient(circle, #888 0%, transparent 70%)',
                    top: '25%', 
                    left: '35%' 
                  }}
                />
                <div 
                  className="absolute w-2 h-2 rounded-full opacity-15"
                  style={{ 
                    background: 'radial-gradient(circle, #888 0%, transparent 70%)',
                    top: '55%', 
                    left: '55%' 
                  }}
                />
                <div 
                  className="absolute w-4 h-4 rounded-full opacity-10"
                  style={{ 
                    background: 'radial-gradient(circle, #888 0%, transparent 70%)',
                    top: '40%', 
                    left: '20%' 
                  }}
                />

                {/* Shadow overlay for phase */}
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-500"
                  style={{
                    background: isWaxing 
                      ? `linear-gradient(to right, hsl(var(--background)) ${shadowPercent}%, transparent ${shadowPercent}%)`
                      : `linear-gradient(to left, hsl(var(--background)) ${shadowPercent}%, transparent ${shadowPercent}%)`,
                  }}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="w-56 p-0">
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Moonrise</span>
                <span className="text-sm font-medium">{riseTime}</span>
              </div>
              {setTime && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Moonset</span>
                  <span className="text-sm font-medium">{setTime}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Illumination</span>
                <span className="text-sm font-medium">{illumination}%</span>
              </div>
              {nextPhase && (
                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Next Phase</span>
                    <span className="text-sm font-medium">{nextPhase}</span>
                  </div>
                  {nextPhaseDate && (
                    <p className="text-xs text-muted-foreground text-right mt-0.5">
                      {nextPhaseDate}
                    </p>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
