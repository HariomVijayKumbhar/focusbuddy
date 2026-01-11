import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, BarChart3, LogOut, Menu, X, Timer, Target, Sparkles } from 'lucide-react';
import { FocusTimer } from '@/components/FocusTimer';
import { ChatWindow } from '@/components/ChatWindow';
import { ProgressStats } from '@/components/ProgressStats';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { GoalsView } from '@/components/GoalsView';
import { HabitsView } from '@/components/HabitsView';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { AchievementBadges } from '@/components/AchievementBadges';
import { EncouragementToast, getRandomMessage } from '@/components/EncouragementToast';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFocusSessions, FocusSession } from '@/hooks/useFocusSessions';
import { useFocusBuddyChat } from '@/hooks/useFocusBuddyChat';
import { useConfetti } from '@/hooks/useConfetti';
import { cn } from '@/lib/utils';

type View = 'timer' | 'chat' | 'stats' | 'goals' | 'habits';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, completeOnboarding } = useProfile();
  const { todayProgress, weeklyProgress, startSession, completeSession, cancelSession } = useFocusSessions();
  const { messages, isLoading, sendMessage, addWelcomeMessage } = useFocusBuddyChat();
  const { fireConfetti } = useConfetti();
  
  const [activeView, setActiveView] = useState<View>('timer');
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [encouragement, setEncouragement] = useState<{ message: string; emoji: string } | null>(null);

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (messages.length === 0 && profile) {
      addWelcomeMessage(profile.display_name || undefined);
    }
  }, [profile, messages.length, addWelcomeMessage]);

  // Show onboarding if not completed
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) {
    return (
      <OnboardingFlow
        initialName={profile.display_name || ''}
        onComplete={async (data) => {
          await completeOnboarding({
            display_name: data.displayName,
            daily_focus_goal_minutes: data.dailyGoal,
            study_schedule: {
              preferred_times: data.preferredTimes,
              study_days: data.studyDays,
            },
            distracting_apps: data.distractingApps,
          });
        }}
      />
    );
  }

  const handleSessionStart = async () => {
    const { data } = await startSession(25, 'focus');
    if (data) {
      setCurrentSession(data);
    }
  };

  const handleSessionComplete = async (minutes: number) => {
    if (currentSession) {
      await completeSession(currentSession.id, minutes);
      setCurrentSession(null);
      
      // Check if streak milestone reached
      const streak = todayProgress?.streak_days || 0;
      if (streak === 3 || streak === 7 || streak === 14 || streak === 30) {
        setTimeout(() => fireConfetti('streak'), 500);
      }
    }
  };

  const handleSessionCancel = async () => {
    if (currentSession) {
      await cancelSession(currentSession.id);
      setCurrentSession(null);
    }
  };

  const showEncouragement = (type: 'start' | 'complete') => {
    const messageType = type === 'start' ? 'sessionStart' : 'sessionComplete';
    const msg = getRandomMessage(messageType);
    setEncouragement(msg);
    setTimeout(() => setEncouragement(null), 4000);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message, {
      inSession: !!currentSession,
      todayStats: todayProgress ? {
        sessionsCompleted: todayProgress.sessions_completed,
        focusMinutes: todayProgress.total_focus_minutes,
        streak: todayProgress.streak_days,
      } : undefined,
      userGoal: profile?.daily_focus_goal_minutes,
    });
  };

  const navItems = [
    { id: 'timer' as View, icon: Timer, label: 'Focus' },
    { id: 'goals' as View, icon: Target, label: 'Goals' },
    { id: 'habits' as View, icon: Sparkles, label: 'Habits' },
    { id: 'chat' as View, icon: MessageCircle, label: 'Chat' },
    { id: 'stats' as View, icon: BarChart3, label: 'Stats' },
  ];

  // Calculate total stats for badges
  const totalMinutes = weeklyProgress.reduce((sum, p) => sum + (p.total_focus_minutes || 0), 0) + (todayProgress?.total_focus_minutes || 0);
  const totalSessions = weeklyProgress.reduce((sum, p) => sum + (p.sessions_completed || 0), 0) + (todayProgress?.sessions_completed || 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Encouragement Toast */}
      <AnimatePresence>
        {encouragement && (
          <EncouragementToast
            message={encouragement.message}
            emoji={encouragement.emoji}
            onDismiss={() => setEncouragement(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-hero flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-foreground">FocusBuddy</h1>
              {profile?.display_name && (
                <p className="text-xs text-muted-foreground -mt-0.5">
                  Hey, {profile.display_name}!
                </p>
              )}
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-muted rounded-xl">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeView === item.id
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50"
          >
            <nav className="container mx-auto px-4 py-3 flex gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    activeView === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'timer' && (
            <div className="max-w-md mx-auto space-y-6">
              {/* Motivational Quote */}
              <MotivationalQuote />

              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Ready to focus?
                </h2>
                <p className="text-muted-foreground">
                  {todayProgress
                    ? `${todayProgress.total_focus_minutes}m focused today`
                    : 'Start your first session'}
                </p>
              </div>

              <FocusTimer
                onSessionStart={handleSessionStart}
                onSessionComplete={handleSessionComplete}
                onSessionCancel={handleSessionCancel}
                distractingApps={profile?.distracting_apps || []}
                onShowEncouragement={showEncouragement}
              />

              {/* Quick Stats Below Timer */}
              {todayProgress && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-card rounded-xl p-3 shadow-card border border-border/50">
                    <div className="text-2xl font-display font-bold text-primary">
                      {todayProgress.sessions_completed}
                    </div>
                    <div className="text-xs text-muted-foreground">sessions</div>
                  </div>
                  <div className="bg-card rounded-xl p-3 shadow-card border border-border/50">
                    <div className="text-2xl font-display font-bold text-foreground">
                      {todayProgress.total_focus_minutes}m
                    </div>
                    <div className="text-xs text-muted-foreground">focused</div>
                  </div>
                  <div className="bg-card rounded-xl p-3 shadow-card border border-border/50">
                    <div className="text-2xl font-display font-bold text-accent">
                      🔥 {todayProgress.streak_days}
                    </div>
                    <div className="text-xs text-muted-foreground">streak</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'chat' && (
            <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)]">
              <ChatWindow
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                placeholder={currentSession 
                  ? "Need help staying focused?" 
                  : "Ask FocusBuddy anything..."}
              />
            </div>
          )}

          {activeView === 'goals' && <GoalsView />}

          {activeView === 'habits' && <HabitsView />}

          {activeView === 'stats' && (
            <div className="max-w-lg mx-auto space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                  Your Progress
                </h2>
                <p className="text-muted-foreground">
                  Keep up the great work!
                </p>
              </div>

              <ProgressStats
                todayMinutes={todayProgress?.total_focus_minutes || 0}
                sessionsCompleted={todayProgress?.sessions_completed || 0}
                streakDays={todayProgress?.streak_days || 0}
                goalMinutes={profile?.daily_focus_goal_minutes || 120}
                weeklyData={weeklyProgress.map(p => ({
                  date: p.date,
                  minutes: p.total_focus_minutes,
                }))}
              />

              {/* Achievement Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card rounded-xl p-5 shadow-card border border-border/50"
              >
                <AchievementBadges
                  totalMinutes={totalMinutes}
                  totalSessions={totalSessions}
                  streakDays={todayProgress?.streak_days || 0}
                />
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-inset-bottom">
        <div className="flex">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                activeView === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
