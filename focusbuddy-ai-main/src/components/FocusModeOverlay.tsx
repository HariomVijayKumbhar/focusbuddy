import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowLeft, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FocusModeOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
  timeRemaining: string;
  distractingApps: string[];
}

export function FocusModeOverlay({ 
  isVisible, 
  onDismiss, 
  timeRemaining,
  distractingApps 
}: FocusModeOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-md w-full text-center space-y-6"
          >
            {/* Shield Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Shield className="w-12 h-12 text-primary" />
            </motion.div>

            {/* Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-foreground">
                Focus Mode Active
              </h2>
              <p className="text-muted-foreground">
                You're in the middle of a focus session. Stay on track!
              </p>
            </div>

            {/* Timer */}
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-1">Time remaining</p>
              <p className="text-4xl font-display font-bold text-primary tabular-nums">
                {timeRemaining}
              </p>
            </div>

            {/* Distracting Apps Reminder */}
            {distractingApps.length > 0 && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="w-4 h-4" />
                  <span>Apps to avoid right now:</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {distractingApps.map((app, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Motivational Quote */}
            <p className="text-sm italic text-muted-foreground">
              "The secret of getting ahead is getting started." – Mark Twain
            </p>

            {/* Return Button */}
            <Button
              variant="hero"
              size="lg"
              onClick={onDismiss}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Focus
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
