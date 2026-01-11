import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Coffee, Brain, Settings2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FocusModeOverlay } from './FocusModeOverlay';
import { useConfetti } from '@/hooks/useConfetti';

interface FocusTimerProps {
  onSessionStart?: () => void;
  onSessionComplete?: (minutes: number) => void;
  onSessionCancel?: () => void;
  distractingApps?: string[];
  onShowEncouragement?: (type: 'start' | 'complete') => void;
}

type SessionType = 'focus' | 'short_break' | 'long_break';

const DEFAULT_DURATIONS = {
  focus: 25,
  short_break: 5,
  long_break: 15,
};

export function FocusTimer({ onSessionStart, onSessionComplete, onSessionCancel, distractingApps = [], onShowEncouragement }: FocusTimerProps) {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [customDurations, setCustomDurations] = useState(DEFAULT_DURATIONS);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_DURATIONS.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const { fireConfetti } = useConfetti();

  const SESSION_CONFIG = {
    focus: { duration: customDurations.focus * 60, label: 'Focus Time', icon: Brain },
    short_break: { duration: customDurations.short_break * 60, label: 'Short Break', icon: Coffee },
    long_break: { duration: customDurations.long_break * 60, label: 'Long Break', icon: Coffee },
  };

  const totalDuration = SESSION_CONFIG[sessionType].duration;
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            if (sessionType === 'focus') {
              const elapsedMinutes = Math.round(totalDuration / 60);
              onSessionComplete?.(elapsedMinutes);
              // Fire confetti on session complete
              fireConfetti('session');
              onShowEncouragement?.('complete');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, sessionType, totalDuration, onSessionComplete, fireConfetti, onShowEncouragement]);

  // Page visibility detection - show overlay when tab loses focus during focus session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && sessionType === 'focus') {
        setShowFocusOverlay(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRunning && sessionType === 'focus') {
        e.preventDefault();
        e.returnValue = 'You have an active focus session. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, sessionType]);

  const handleStart = useCallback(() => {
    if (!isRunning && timeRemaining === totalDuration) {
      onSessionStart?.();
      if (sessionType === 'focus') {
        onShowEncouragement?.('start');
      }
    }
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setIsComplete(false);
  }, [isRunning, timeRemaining, totalDuration, onSessionStart, sessionType, onShowEncouragement]);

  const handlePause = useCallback(() => {
    pausedTimeRef.current = timeRemaining;
    setIsRunning(false);
  }, [timeRemaining]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(totalDuration);
    setIsComplete(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
  }, [totalDuration]);

  const handleCancel = useCallback(() => {
    handleReset();
    onSessionCancel?.();
  }, [handleReset, onSessionCancel]);

  const handleSessionTypeChange = (type: SessionType) => {
    if (isRunning) return;
    setSessionType(type);
    setTimeRemaining(SESSION_CONFIG[type].duration);
    setIsComplete(false);
  };

  const adjustDuration = (type: SessionType, delta: number) => {
    setCustomDurations(prev => {
      const newValue = Math.max(1, Math.min(120, prev[type] + delta));
      const updated = { ...prev, [type]: newValue };
      if (type === sessionType && !isRunning) {
        setTimeRemaining(newValue * 60);
      }
      return updated;
    });
  };

  // SVG circle dimensions
  const size = 280;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Session Type Selector with Settings */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {(['focus', 'short_break', 'long_break'] as SessionType[]).map(type => {
            const config = SESSION_CONFIG[type];
            const Icon = config.icon;
            return (
              <button
                key={type}
                onClick={() => handleSessionTypeChange(type)}
                disabled={isRunning}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  sessionType === type
                    ? "bg-card shadow-card text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                  isRunning && "cursor-not-allowed opacity-60"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={isRunning}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground">Customize Durations</h4>
              
              {(['focus', 'short_break', 'long_break'] as SessionType[]).map(type => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {type === 'focus' ? 'Focus' : type === 'short_break' ? 'Short Break' : 'Long Break'}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustDuration(type, -5)}
                      disabled={customDurations[type] <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-12 text-center text-sm font-medium tabular-nums">
                      {customDurations[type]}m
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => adjustDuration(type, 5)}
                      disabled={customDurations[type] >= 120}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setCustomDurations(DEFAULT_DURATIONS);
                  setTimeRemaining(DEFAULT_DURATIONS[sessionType] * 60);
                }}
              >
                Reset to Defaults
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Timer Circle */}
      <div className="relative">
        <motion.div
          className="relative"
          animate={isRunning ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="timer-ring-bg"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              className="timer-ring"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="text-center"
                >
                  <span className="text-4xl">🎉</span>
                  <p className="text-lg font-medium text-primary mt-2">Complete!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <span className="text-5xl font-display font-bold tabular-nums text-foreground">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {SESSION_CONFIG[sessionType].label}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Glow effect when running */}
        {isRunning && (
          <div className="absolute inset-0 rounded-full shadow-glow animate-pulse-slow pointer-events-none" />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRunning && !isComplete && (
          <Button
            variant="hero"
            size="xl"
            onClick={handleStart}
            className="min-w-[140px]"
          >
            <Play className="w-5 h-5" />
            {timeRemaining === totalDuration ? 'Start' : 'Resume'}
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePause}
            >
              <Pause className="w-5 h-5" />
              Pause
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleCancel}
            >
              <Square className="w-5 h-5" />
              End
            </Button>
          </>
        )}

        {isComplete && (
          <Button
            variant="hero"
            size="xl"
            onClick={handleReset}
          >
            <RotateCcw className="w-5 h-5" />
            New Session
          </Button>
        )}

        {!isRunning && !isComplete && timeRemaining !== totalDuration && (
          <Button
            variant="ghost"
            size="lg"
            onClick={handleReset}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
        )}
      </div>

      {/* Focus Mode Overlay */}
      <FocusModeOverlay
        isVisible={showFocusOverlay}
        onDismiss={() => setShowFocusOverlay(false)}
        timeRemaining={`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
        distractingApps={distractingApps}
      />
    </div>
  );
}
