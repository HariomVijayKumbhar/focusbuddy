import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Calendar, Flag, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Goal, useGoals } from '@/hooks/useGoals';
import { cn } from '@/lib/utils';

const CATEGORY_OPTIONS = [
  { value: 'study', label: 'Study', emoji: '📚' },
  { value: 'exam', label: 'Exam', emoji: '📝' },
  { value: 'project', label: 'Project', emoji: '💼' },
  { value: 'reading', label: 'Reading', emoji: '📖' },
  { value: 'skill', label: 'Skill', emoji: '🎯' },
  { value: 'other', label: 'Other', emoji: '✨' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'text-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'text-accent' },
  { value: 'high', label: 'High', color: 'text-destructive' },
];

export function GoalsView() {
  const { activeGoals, completedGoals, createGoal, updateGoal, completeGoal, deleteGoal } = useGoals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: '',
    category: 'study' as Goal['category'],
    priority: 'medium' as Goal['priority'],
    progress: 0,
  });

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return;

    await createGoal({
      ...newGoal,
      target_date: newGoal.target_date || null,
      description: newGoal.description || null,
    });

    setNewGoal({
      title: '',
      description: '',
      target_date: '',
      category: 'study',
      priority: 'medium',
      progress: 0,
    });
    setShowAddForm(false);
  };

  const handleProgressChange = async (goalId: string, progress: number) => {
    await updateGoal(goalId, { progress });
  };

  const getCategoryEmoji = (category: string) => {
    return CATEGORY_OPTIONS.find(c => c.value === category)?.emoji || '✨';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-destructive' };
    if (diffDays === 0) return { text: 'Today', color: 'text-accent' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-accent' };
    if (diffDays <= 7) return { text: `${diffDays} days`, color: 'text-muted-foreground' };
    return { text: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-muted-foreground' };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Your Goals</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {activeGoals.length} active goal{activeGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant={showAddForm ? "secondary" : "hero"}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {/* Add Goal Form */}
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
                placeholder="What's your goal?"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-lg font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />

              <textarea
                placeholder="Add details (optional)"
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setNewGoal(prev => ({ ...prev, category: cat.value as Goal['category'] }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          newGoal.category === cat.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map(pri => (
                      <button
                        key={pri.value}
                        onClick={() => setNewGoal(prev => ({ ...prev, priority: pri.value as Goal['priority'] }))}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1",
                          newGoal.priority === pri.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80",
                          pri.color
                        )}
                      >
                        <Flag className="w-3 h-3" />
                        {pri.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Target Date</label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="px-4 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <Button
                variant="hero"
                onClick={handleCreateGoal}
                disabled={!newGoal.title.trim()}
                className="w-full"
              >
                Create Goal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Goals */}
      <div className="space-y-3">
        {activeGoals.map((goal, index) => {
          const dateInfo = formatDate(goal.target_date);
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl shadow-card border border-border/50 p-4"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => completeGoal(goal.id)}
                  className="mt-1 w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/10 transition-colors"
                >
                  {goal.progress === 100 && <Check className="w-4 h-4 text-primary" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {getCategoryEmoji(goal.category)} {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs">
                    {dateInfo && (
                      <span className={cn("flex items-center gap-1", dateInfo.color)}>
                        <Calendar className="w-3 h-3" />
                        {dateInfo.text}
                      </span>
                    )}
                    <span className={cn(
                      "flex items-center gap-1",
                      PRIORITY_OPTIONS.find(p => p.value === goal.priority)?.color
                    )}>
                      <Flag className="w-3 h-3" />
                      {goal.priority}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{goal.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progress}
                      onChange={(e) => handleProgressChange(goal.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {activeGoals.length === 0 && !showAddForm && (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <Target className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No active goals yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="mt-4"
            >
              <Plus className="w-4 h-4" />
              Create your first goal
            </Button>
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCompleted ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {completedGoals.length} completed goal{completedGoals.length !== 1 ? 's' : ''}
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                {completedGoals.map(goal => (
                  <div
                    key={goal.id}
                    className="bg-muted/50 rounded-xl p-4 flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-4 h-4 text-success-foreground" />
                    </div>
                    <span className="text-muted-foreground line-through flex-1">
                      {getCategoryEmoji(goal.category)} {goal.title}
                    </span>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
