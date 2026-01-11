import { motion } from 'framer-motion';
import { Flame, Clock, Target, Zap, Trophy, Star, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgesProps {
  totalMinutes: number;
  totalSessions: number;
  streakDays: number;
  goalsCompleted?: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: typeof Flame;
  color: string;
  bgColor: string;
  unlocked: boolean;
  progress?: number;
  requirement?: string;
}

export function AchievementBadges({ 
  totalMinutes, 
  totalSessions, 
  streakDays,
  goalsCompleted = 0,
}: AchievementBadgesProps) {
  const badges: Badge[] = [
    {
      id: 'first-session',
      name: 'First Step',
      description: 'Complete your first focus session',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      unlocked: totalSessions >= 1,
    },
    {
      id: 'focus-hour',
      name: 'Hour Hero',
      description: 'Reach 60 minutes of total focus time',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      unlocked: totalMinutes >= 60,
      progress: totalMinutes < 60 ? (totalMinutes / 60) * 100 : 100,
      requirement: `${Math.min(totalMinutes, 60)}/60 min`,
    },
    {
      id: 'streak-3',
      name: 'On Fire',
      description: 'Maintain a 3-day focus streak',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      unlocked: streakDays >= 3,
      progress: streakDays < 3 ? (streakDays / 3) * 100 : 100,
      requirement: `${Math.min(streakDays, 3)}/3 days`,
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day focus streak',
      icon: Star,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      unlocked: streakDays >= 7,
      progress: streakDays < 7 ? (streakDays / 7) * 100 : 100,
      requirement: `${Math.min(streakDays, 7)}/7 days`,
    },
    {
      id: 'sessions-10',
      name: 'Dedicated',
      description: 'Complete 10 focus sessions',
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      unlocked: totalSessions >= 10,
      progress: totalSessions < 10 ? (totalSessions / 10) * 100 : 100,
      requirement: `${Math.min(totalSessions, 10)}/10 sessions`,
    },
    {
      id: 'focus-5-hours',
      name: 'Focus Master',
      description: 'Accumulate 5 hours of focus time',
      icon: Trophy,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      unlocked: totalMinutes >= 300,
      progress: totalMinutes < 300 ? (totalMinutes / 300) * 100 : 100,
      requirement: `${Math.floor(Math.min(totalMinutes, 300) / 60)}/${5} hours`,
    },
    {
      id: 'goal-crusher',
      name: 'Goal Crusher',
      description: 'Complete 5 goals',
      icon: Award,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      unlocked: goalsCompleted >= 5,
      progress: goalsCompleted < 5 ? (goalsCompleted / 5) * 100 : 100,
      requirement: `${Math.min(goalsCompleted, 5)}/5 goals`,
    },
    {
      id: 'streak-30',
      name: 'Legend',
      description: 'Maintain a 30-day focus streak',
      icon: Crown,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      unlocked: streakDays >= 30,
      progress: streakDays < 30 ? (streakDays / 30) * 100 : 100,
      requirement: `${Math.min(streakDays, 30)}/30 days`,
    },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-foreground">Achievements</h3>
        <span className="text-xs text-muted-foreground">
          {unlockedCount}/{badges.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="group relative"
            >
              <div
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl border transition-all duration-200",
                  badge.unlocked
                    ? `${badge.bgColor} border-transparent`
                    : "bg-muted/50 border-border/50 opacity-50 grayscale"
                )}
              >
                <div className="relative">
                  <Icon className={cn("w-6 h-6", badge.unlocked ? badge.color : "text-muted-foreground")} />
                  {badge.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full flex items-center justify-center"
                    >
                      <span className="text-[8px] text-success-foreground">✓</span>
                    </motion.div>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 text-center leading-tight">
                  {badge.name}
                </span>
                {!badge.unlocked && badge.progress !== undefined && (
                  <div className="w-full h-1 bg-border/50 rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-primary/50 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${badge.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-popover text-popover-foreground text-xs p-2 rounded-lg shadow-lg border border-border whitespace-nowrap">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-muted-foreground">{badge.description}</p>
                  {badge.requirement && !badge.unlocked && (
                    <p className="text-primary mt-1">{badge.requirement}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
