import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, Check, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';

const HABIT_ICONS = ['✓', '📚', '💪', '🧘', '💧', '🏃', '📝', '🎯', '💤', '🥗', '🧠', '✨'];

const HABIT_COLORS = [
  { value: 'primary', label: 'Green', class: 'bg-primary' },
  { value: 'accent', label: 'Amber', class: 'bg-accent' },
  { value: 'destructive', label: 'Coral', class: 'bg-destructive' },
  { value: 'secondary', label: 'Warm', class: 'bg-secondary' },
];

export function HabitsView() {
  const { habits, toggleHabitCompletion, createHabit, deleteHabit, completedTodayCount, totalActiveHabits } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: '',
    description: '',
    icon: '✓',
    color: 'primary',
    frequency: 'daily' as const,
    custom_days: [] as string[],
    reminder_time: null as string | null,
  });

  const handleCreateHabit = async () => {
    if (!newHabit.title.trim()) return;

    await createHabit({
      ...newHabit,
      description: newHabit.description || null,
    });

    setNewHabit({
      title: '',
      description: '',
      icon: '✓',
      color: 'primary',
      frequency: 'daily',
      custom_days: [],
      reminder_time: null,
    });
    setShowAddForm(false);
  };

  const allCompleted = totalActiveHabits > 0 && completedTodayCount === totalActiveHabits;
  const progress = totalActiveHabits > 0 ? (completedTodayCount / totalActiveHabits) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Progress */}
      <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground">Daily Habits</h2>
            <p className="text-muted-foreground text-sm mt-1">
              {allCompleted ? (
                <span className="text-success flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> All done for today!
                </span>
              ) : (
                `${completedTodayCount} of ${totalActiveHabits} completed today`
              )}
            </p>
          </div>
          <Button
            variant={showAddForm ? "secondary" : "hero"}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Cancel' : 'New Habit'}
          </Button>
        </div>

        {/* Progress Bar */}
        {totalActiveHabits > 0 && (
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                "h-full rounded-full",
                allCompleted ? "bg-success" : "bg-primary"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {/* Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 space-y-4">
              <input
                type="text"
                placeholder="Name your habit..."
                value={newHabit.title}
                onChange={(e) => setNewHabit(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />

              <input
                type="text"
                placeholder="Add a note (optional)"
                value={newHabit.description}
                onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewHabit(prev => ({ ...prev, icon }))}
                      className={cn(
                        "w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all",
                        newHabit.icon === icon
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewHabit(prev => ({ ...prev, color: color.value }))}
                      className={cn(
                        "w-10 h-10 rounded-xl transition-all",
                        color.class,
                        newHabit.color === color.value && "ring-2 ring-offset-2 ring-ring scale-110"
                      )}
                    />
                  ))}
                </div>
              </div>

              <Button
                variant="hero"
                onClick={handleCreateHabit}
                disabled={!newHabit.title.trim()}
                className="w-full"
              >
                Create Habit
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit, index) => {
          const colorClass = HABIT_COLORS.find(c => c.value === habit.color)?.class || 'bg-primary';
          
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "bg-card rounded-xl shadow-card border border-border/50 p-4 transition-all",
                habit.completedToday && "bg-success/5 border-success/30"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Check Button */}
                <button
                  onClick={() => toggleHabitCompletion(habit.id)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all duration-300",
                    habit.completedToday
                      ? "bg-success text-success-foreground scale-105"
                      : cn(colorClass, "text-white opacity-70 hover:opacity-100")
                  )}
                >
                  {habit.completedToday ? <Check className="w-6 h-6" /> : habit.icon}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium transition-all",
                    habit.completedToday ? "text-success line-through" : "text-foreground"
                  )}>
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {habit.description}
                    </p>
                  )}
                </div>

                {/* Streak */}
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 text-accent">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-medium">{habit.streak}</span>
                  </div>
                )}

                {/* Delete */}
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {habits.length === 0 && !showAddForm && (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No habits yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Build consistency with daily habits
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Create your first habit
            </Button>
          </div>
        )}
      </div>

      {/* Motivation */}
      {allCompleted && habits.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-success/10 to-primary/10 rounded-2xl p-6 text-center border border-success/20"
        >
          <span className="text-4xl">🎉</span>
          <h3 className="font-display font-bold text-lg mt-2 text-foreground">
            Amazing work!
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            You've completed all your habits for today. Keep it up!
          </p>
        </motion.div>
      )}
    </div>
  );
}
