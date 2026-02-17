import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface DataPoint {
  time: string;
  visibility: number;
}

interface VisibilityChartProps {
  baseScore: number;
}

const generateForecastData = (baseScore: number, range: "12h" | "24h" | "week"): DataPoint[] => {
  if (range === "12h") {
    const hours = ["20:00", "22:00", "00:00", "02:00", "04:00", "06:00"];
    return hours.map((time, i) => ({
      time,
      visibility: Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 20 + (i < 3 ? i * 5 : (5 - i) * 5))),
    }));
  } else if (range === "24h") {
    const hours = ["18:00", "20:00", "22:00", "00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00"];
    return hours.map((time, i) => ({
      time,
      visibility: Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 25 + Math.sin(i * 0.5) * 15)),
    }));
  } else {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((time, i) => ({
      time,
      visibility: Math.max(20, Math.min(100, baseScore + (Math.random() - 0.5) * 30 + Math.cos(i * 0.8) * 20)),
    }));
  }
};

const getRangeLabel = (range: "12h" | "24h" | "week") => {
  switch (range) {
    case "12h": return "Next 12 Hours Forecast";
    case "24h": return "Next 24 Hours Forecast";
    case "week": return "7-Day Forecast";
  }
};

export function VisibilityChart({ baseScore }: VisibilityChartProps) {
  const [timeRange, setTimeRange] = useState<"12h" | "24h" | "week">("12h");
  
  const data = useMemo(() => generateForecastData(baseScore, timeRange), [baseScore, timeRange]);

  return (
    <div className="glass-card card-glow rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-foreground">Visibility Window</h3>
          <p className="text-xs text-muted-foreground mt-1">{getRangeLabel(timeRange)}</p>
        </div>
        <div className="flex bg-muted rounded-lg p-1">
          {(["12h", "24h", "week"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                timeRange === range 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range === "week" ? "Week" : range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="visibilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 9%)',
                border: '1px solid hsl(217, 33%, 20%)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              labelStyle={{ color: 'hsl(210, 40%, 98%)' }}
              itemStyle={{ color: 'hsl(217, 91%, 60%)' }}
            />
            <Area
              type="monotone"
              dataKey="visibility"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#visibilityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
