import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface FocusSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  completed: boolean;
  session_type: 'focus' | 'short_break' | 'long_break';
  notes: string | null;
  created_at: string;
}

export interface DailyProgress {
  id: string;
  user_id: string;
  date: string;
  total_focus_minutes: number;
  sessions_completed: number;
  streak_days: number;
}

export function useFocusSessions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [todayProgress, setTodayProgress] = useState<DailyProgress | null>(null);
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
      fetchProgress();
    } else {
      setSessions([]);
      setTodayProgress(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions((data as FocusSession[]) || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;

    try {
      // Fetch today's progress
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData, error: todayError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (todayError && todayError.code !== 'PGRST116') {
        throw todayError;
      }
      setTodayProgress(todayData as DailyProgress | null);

      // Fetch last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { data: weekData, error: weekError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (weekError) throw weekError;
      setWeeklyProgress((weekData as DailyProgress[]) || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (durationMinutes: number = 25, sessionType: 'focus' | 'short_break' | 'long_break' = 'focus') => {
    if (!user) return { data: null, error: new Error('Not authenticated') };

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          duration_minutes: durationMinutes,
          session_type: sessionType,
        })
        .select()
        .single();

      if (error) throw error;
      
      setSessions(prev => [data as FocusSession, ...prev]);
      return { data: data as FocusSession, error: null };
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    }
  };

  const completeSession = async (sessionId: string, actualMinutes: number) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Update the session
      const { error: sessionError } = await supabase
        .from('focus_sessions')
        .update({
          ended_at: new Date().toISOString(),
          completed: true,
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Update or create daily progress
      const today = new Date().toISOString().split('T')[0];
      
      // First, try to get existing progress
      const { data: existingProgress } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (existingProgress) {
        // Update existing
        const { error: updateError } = await supabase
          .from('daily_progress')
          .update({
            total_focus_minutes: existingProgress.total_focus_minutes + actualMinutes,
            sessions_completed: existingProgress.sessions_completed + 1,
          })
          .eq('id', existingProgress.id);

        if (updateError) throw updateError;
      } else {
        // Calculate streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const { data: yesterdayProgress } = await supabase
          .from('daily_progress')
          .select('streak_days')
          .eq('user_id', user.id)
          .eq('date', yesterday.toISOString().split('T')[0])
          .single();

        const newStreak = yesterdayProgress ? yesterdayProgress.streak_days + 1 : 1;

        // Create new progress record
        const { error: insertError } = await supabase
          .from('daily_progress')
          .insert({
            user_id: user.id,
            date: today,
            total_focus_minutes: actualMinutes,
            sessions_completed: 1,
            streak_days: newStreak,
          });

        if (insertError) throw insertError;
      }

      // Refresh data
      await fetchSessions();
      await fetchProgress();

      toast({
        title: "Session complete! 🎉",
        description: `You focused for ${actualMinutes} minutes. Great work!`,
      });

      return { error: null };
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Error",
        description: "Failed to save session",
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const cancelSession = async (sessionId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('focus_sessions')
        .delete()
        .eq('id', sessionId);

      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Error canceling session:', error);
    }
  };

  return {
    sessions,
    todayProgress,
    weeklyProgress,
    loading,
    startSession,
    completeSession,
    cancelSession,
    refetch: () => {
      fetchSessions();
      fetchProgress();
    },
  };
}
