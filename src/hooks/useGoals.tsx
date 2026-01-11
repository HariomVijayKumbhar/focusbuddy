import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  category: 'study' | 'exam' | 'project' | 'reading' | 'skill' | 'other';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
    } else {
      setGoals([]);
      setLoading(false);
    }
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals((data as Goal[]) || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'completed' | 'completed_at' | 'created_at' | 'updated_at'>) => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          ...goal,
        })
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data as Goal, ...prev]);
      toast({
        title: "Goal created! 🎯",
        description: "Your new goal has been added",
      });
      return { data: data as Goal, error: null };
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => prev.map(g => g.id === id ? data as Goal : g));
      return { error: null };
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: "Error",
        description: "Failed to update goal",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const completeGoal = async (id: string) => {
    return updateGoal(id, {
      completed: true,
      completed_at: new Date().toISOString(),
      progress: 100,
    });
  };

  const deleteGoal = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
      toast({
        title: "Goal deleted",
        description: "The goal has been removed",
      });
      return { error: null };
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    createGoal,
    updateGoal,
    completeGoal,
    deleteGoal,
    refetch: fetchGoals,
  };
}
