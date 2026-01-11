import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Clock, Calendar, Smartphone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingData {
  displayName: string;
  dailyGoal: number;
  preferredTimes: string[];
  studyDays: string[];
  distractingApps: string[];
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialName?: string;
}

const TIME_OPTIONS = [
  { id: 'morning', label: 'Morning', time: '6am - 12pm' },
  { id: 'afternoon', label: 'Afternoon', time: '12pm - 5pm' },
  { id: 'evening', label: 'Evening', time: '5pm - 9pm' },
  { id: 'night', label: 'Night', time: '9pm - 12am' },
];

const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const GOAL_OPTIONS = [
  { value: 60, label: '1 hour', description: 'Light study day' },
  { value: 120, label: '2 hours', description: 'Recommended' },
  { value: 180, label: '3 hours', description: 'Focused day' },
  { value: 240, label: '4+ hours', description: 'Intense study' },
];

const APP_OPTIONS = [
  'Instagram', 'TikTok', 'Twitter/X', 'YouTube', 'Reddit', 
  'Snapchat', 'Facebook', 'Games', 'Netflix', 'Other'
];

export function OnboardingFlow({ onComplete, initialName = '' }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    displayName: initialName,
    dailyGoal: 120,
    preferredTimes: [],
    studyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    distractingApps: [],
  });

  const steps = [
    { title: "What's your name?", icon: User },
    { title: "Daily focus goal", icon: Clock },
    { title: "When do you study best?", icon: Calendar },
    { title: "What distracts you?", icon: Smartphone },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return data.displayName.trim().length >= 2;
      case 1: return data.dailyGoal > 0;
      case 2: return data.preferredTimes.length > 0;
      case 3: return true; // Optional step
      default: return true;
    }
  };

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete({
        ...data,
        dailyGoal: data.dailyGoal,
      });
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-background to-secondary/20">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === step 
                  ? "w-8 bg-primary" 
                  : index < step 
                    ? "bg-primary/50" 
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                  {(() => {
                    const Icon = steps[step].icon;
                    return <Icon className="w-5 h-5 text-primary-foreground" />;
                  })()}
                </div>
                <h2 className="text-xl font-display font-bold">{steps[step].title}</h2>
              </div>

              {/* Step 0: Name */}
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    I'll use this to personalize your experience
                  </p>
                  <input
                    type="text"
                    value={data.displayName}
                    onChange={(e) => setData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                </div>
              )}

              {/* Step 1: Daily Goal */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    How much time do you want to dedicate to focused study?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {GOAL_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => setData(prev => ({ ...prev, dailyGoal: option.value }))}
                        className={cn(
                          "p-4 rounded-xl border-2 text-left transition-all duration-200",
                          data.dailyGoal === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className="font-semibold">{option.label}</div>
                        <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Study Times */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Select your preferred study times
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {TIME_OPTIONS.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setData(prev => ({
                            ...prev,
                            preferredTimes: toggleArrayItem(prev.preferredTimes, option.id)
                          }))}
                          className={cn(
                            "p-3 rounded-xl border-2 text-left transition-all duration-200",
                            data.preferredTimes.includes(option.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          <div className="font-medium text-sm">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm mb-3">
                      Which days do you study?
                    </p>
                    <div className="flex gap-2">
                      {DAY_OPTIONS.map(day => (
                        <button
                          key={day}
                          onClick={() => setData(prev => ({
                            ...prev,
                            studyDays: toggleArrayItem(prev.studyDays, day)
                          }))}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 text-xs font-medium transition-all duration-200",
                            data.studyDays.includes(day)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary/30"
                          )}
                        >
                          {day[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Distracting Apps */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Which apps tend to distract you? (Optional - helps me support you better)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {APP_OPTIONS.map(app => (
                      <button
                        key={app}
                        onClick={() => setData(prev => ({
                          ...prev,
                          distractingApps: toggleArrayItem(prev.distractingApps, app)
                        }))}
                        className={cn(
                          "px-4 py-2 rounded-full border text-sm transition-all duration-200",
                          data.distractingApps.includes(app)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0}
              className={cn(step === 0 && "invisible")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              variant="hero"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === steps.length - 1 ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip Option */}
        {step === 3 && (
          <button
            onClick={handleNext}
            className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip this step
          </button>
        )}
      </motion.div>
    </div>
  );
}
