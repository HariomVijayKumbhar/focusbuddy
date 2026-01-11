import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  custom_days: string[];
  reminder_time: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completed_date: string;
  notes: string | null;
}

export interface HabitWithCompletions extends Habit {
  completions: HabitCompletion[];
  completedToday: boolean;
  streak: number;
}

export function useHabits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHabits();
    } else {
      setHabits([]);
      setLoading(false);
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;

    try {
      // Get habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      // Get completions for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: completionsData, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (completionsError) throw completionsError;

      const today = new Date().toISOString().split('T')[0];

      // Combine habits with their completions
      const habitsWithCompletions: HabitWithCompletions[] = (habitsData || []).map(habit => {
        const habitCompletions = (completionsData || []).filter(c => c.habit_id === habit.id);
        const completedToday = habitCompletions.some(c => c.completed_date === today);
        
        // Calculate streak
        let streak = 0;
        const sortedCompletions = habitCompletions
          .map(c => c.completed_date)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (sortedCompletions.length > 0) {
          const checkDate = new Date();
          // If not completed today, start checking from yesterday
          if (!completedToday) {
            checkDate.setDate(checkDate.getDate() - 1);
          }

          for (const dateStr of sortedCompletions) {
            const completionDate = checkDate.toISOString().split('T')[0];
            if (dateStr === completionDate) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        return {
          ...habit,
          completions: habitCompletions,
          completedToday,
          streak,
        } as HabitWithCompletions;
      });

      setHabits(habitsWithCompletions);
    } catch (error) {
      console.error('Error fetching habits:', error);
      toast({
        title: "Error",
        description: "Failed to load habits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habit: Omit<Habit, 'id' | 'user_id' | 'is_active' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          ...habit,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchHabits();
      toast({
        title: "Habit created! ✨",
        description: "Your new habit has been added",
      });
      return { data: data as Habit, error: null };
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        title: "Error",
        description: "Failed to create habit",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    }
  };

  const toggleHabitCompletion = async (habitId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { error: new Error('Habit not found') };

    const today = new Date().toISOString().split('T')[0];

    try {
      if (habit.completedToday) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', today);

        if (error) throw error;
      } else {
        // Add completion
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            user_id: user.id,
            habit_id: habitId,
            completed_date: today,
          });

        if (error) throw error;

        toast({
          title: "Great job! 🎉",
          description: `You completed "${habit.title}"`,
        });
      }

      await fetchHabits();
      return { error: null };
    } catch (error) {
      console.error('Error toggling habit:', error);
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const deleteHabit = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHabits(prev => prev.filter(h => h.id !== id));
      toast({
        title: "Habit deleted",
        description: "The habit has been removed",
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        title: "Error",
        description: "Failed to delete habit",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const completedTodayCount = habits.filter(h => h.completedToday).length;
  const totalActiveHabits = habits.length;

  return {
    habits,
    loading,
    createHabit,
    toggleHabitCompletion,
    deleteHabit,
    completedTodayCount,
    totalActiveHabits,
    refetch: fetchHabits,
  };
}
