import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface EncouragementToastProps {
  message: string;
  emoji?: string;
  onDismiss?: () => void;
}

export function EncouragementToast({ message, emoji = '✨', onDismiss }: EncouragementToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      onClick={onDismiss}
    >
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform">
        <span className="text-xl">{emoji}</span>
        <p className="text-sm font-medium">{message}</p>
        <Sparkles className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

// Encouraging messages for different scenarios
export const ENCOURAGEMENT_MESSAGES = {
  sessionStart: [
    { message: "You've got this! Let's crush it 💪", emoji: "🎯" },
    { message: "Time to make magic happen!", emoji: "✨" },
    { message: "Your future self will thank you!", emoji: "🚀" },
    { message: "Let's build something amazing!", emoji: "🌟" },
  ],
  sessionComplete: [
    { message: "Incredible focus! You nailed it!", emoji: "🎉" },
    { message: "Another session done! Keep the momentum!", emoji: "🔥" },
    { message: "You're unstoppable today!", emoji: "💪" },
    { message: "That's the way! Amazing work!", emoji: "⭐" },
  ],
  streakMilestone: [
    { message: "3-day streak! You're on fire!", emoji: "🔥" },
    { message: "7-day streak! Week warrior mode!", emoji: "⚡" },
    { message: "14-day streak! Absolute legend!", emoji: "👑" },
    { message: "30-day streak! Unstoppable force!", emoji: "🏆" },
  ],
  goalComplete: [
    { message: "Goal crushed! What's next?", emoji: "🎯" },
    { message: "One step closer to greatness!", emoji: "🌟" },
    { message: "You did it! Celebrate this win!", emoji: "🎊" },
  ],
  dailyGoalReached: [
    { message: "Daily goal reached! Outstanding!", emoji: "✅" },
    { message: "You hit your target! Well done!", emoji: "🎯" },
    { message: "Mission accomplished for today!", emoji: "🏅" },
  ],
  newBadge: [
    { message: "New badge unlocked!", emoji: "🏆" },
    { message: "Achievement unlocked! Nice work!", emoji: "⭐" },
    { message: "You earned a new badge!", emoji: "🎖️" },
  ],
};

export function getRandomMessage(type: keyof typeof ENCOURAGEMENT_MESSAGES) {
  const messages = ENCOURAGEMENT_MESSAGES[type];
  return messages[Math.floor(Math.random() * messages.length)];
}
