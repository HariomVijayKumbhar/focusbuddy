import { motion } from 'framer-motion';
import { Flame, Clock, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStatsProps {
  todayMinutes: number;
  sessionsCompleted: number;
  streakDays: number;
  goalMinutes: number;
  weeklyData?: { date: string; minutes: number }[];
}

export function ProgressStats({
  todayMinutes,
  sessionsCompleted,
  streakDays,
  goalMinutes,
  weeklyData = [],
}: ProgressStatsProps) {
  const goalProgress = Math.min((todayMinutes / goalMinutes) * 100, 100);

  const stats = [
    {
      label: 'Today',
      value: `${todayMinutes}m`,
      subtext: `of ${goalMinutes}m goal`,
      icon: Clock,
      progress: goalProgress,
    },
    {
      label: 'Sessions',
      value: sessionsCompleted.toString(),
      subtext: 'completed today',
      icon: Target,
    },
    {
      label: 'Streak',
      value: `${streakDays}`,
      subtext: streakDays === 1 ? 'day' : 'days',
      icon: Flame,
      highlight: streakDays >= 7,
    },
  ];

  // Generate last 7 days for chart
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  const orderedDays = [...days.slice(today), ...days.slice(0, today)];

  // Get max value for scaling
  const maxMinutes = Math.max(goalMinutes, ...weeklyData.map(d => d.minutes), todayMinutes) || goalMinutes;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "bg-card rounded-xl p-4 shadow-card border border-border/50",
              stat.highlight && "ring-2 ring-accent"
            )}
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <stat.icon className={cn(
                "w-4 h-4",
                stat.highlight && "text-accent"
              )} />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <div className={cn(
              "text-2xl font-display font-bold",
              stat.highlight && "text-accent"
            )}>
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{stat.subtext}</div>
            
            {stat.progress !== undefined && (
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl p-5 shadow-card border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">This Week</h3>
          </div>
          <span className="text-xs text-muted-foreground">Focus minutes</span>
        </div>

        <div className="flex items-end justify-between gap-1 h-24">
          {orderedDays.map((day, index) => {
            const dayData = weeklyData[index];
            const minutes = dayData?.minutes || (index === 6 ? todayMinutes : 0);
            const height = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
            const isToday = index === 6;

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  className="w-full flex flex-col items-center"
                  initial={{ height: 0 }}
                  animate={{ height: '100%' }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.4 }}
                >
                  <div className="relative w-full h-20 flex items-end justify-center">
                    <motion.div
                      className={cn(
                        "w-full max-w-[24px] rounded-t-md",
                        isToday 
                          ? "bg-primary" 
                          : minutes > 0 
                            ? "bg-primary/40" 
                            : "bg-muted"
                      )}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 4)}%` }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.5, ease: "easeOut" }}
                    />
                    {minutes > 0 && (
                      <span className="absolute -top-5 text-[10px] text-muted-foreground">
                        {minutes}
                      </span>
                    )}
                  </div>
                </motion.div>
                <span className={cn(
                  "text-[10px]",
                  isToday ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
