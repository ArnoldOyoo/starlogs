import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogSession } from "@/components/NewSessionDialog";
import { parse, isValid, format } from "date-fns";

interface ObservationChartsProps {
  logEntries: LogSession[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  boxShadow: "0 10px 30px -10px hsl(var(--foreground) / 0.15)",
};

const parseLogDate = (dateStr: string): Date | null => {
  const d = parse(dateStr, "MMM d, yyyy", new Date());
  return isValid(d) ? d : null;
};

const parseLogHours = (timeRange: string): number | null => {
  // "23:45 - 02:30"
  const match = timeRange.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const startHour = Number(match[1]);
  const startMin = Number(match[2]);
  const endHour = Number(match[3]);
  const endMin = Number(match[4]);

  let startTotal = startHour * 60 + startMin;
  let endTotal = endHour * 60 + endMin;

  if (endTotal < startTotal) endTotal += 24 * 60;

  return (endTotal - startTotal) / 60;
};

export function ObservationCharts({ logEntries }: ObservationChartsProps) {
  const sessionsPerMonth = logEntries.reduce((acc, session) => {
    const d = parseLogDate(session.date);
    if (!d) return acc;

    const key = format(d, "MMM yy");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyData = Object.entries(sessionsPerMonth)
    .map(([month, sessions]) => ({ month, sessions }))
    .slice(-6);

  const objectCounts = logEntries.reduce((acc, session) => {
    session.objects.forEach((obj) => {
      const key = obj.trim();
      if (!key) return;
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topObjects = Object.entries(objectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  const timeByLocation = logEntries.reduce((acc, session) => {
    const hours = parseLogHours(session.time);
    if (hours === null) return acc;

    const key = session.location.trim() || "Unknown";
    acc[key] = (acc[key] || 0) + hours;
    return acc;
  }, {} as Record<string, number>);

  const locationData = Object.entries(timeByLocation)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value: Math.round(value * 10) / 10 }));

  if (logEntries.length === 0) {
    return (
      <Card className="glass-card mb-6">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>Start logging observation sessions to see your statistics here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sessions per Month</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
              <Bar dataKey="sessions" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Most Observed Objects</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          {topObjects.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topObjects}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name }) => String(name)}
                >
                  {topObjects.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No objects logged yet</div>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Hours by Location</CardTitle>
        </CardHeader>
        <CardContent className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationData} layout="vertical">
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "hsl(var(--foreground))" }} formatter={(value) => [`${value}h`, "Time"]} />
              <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
