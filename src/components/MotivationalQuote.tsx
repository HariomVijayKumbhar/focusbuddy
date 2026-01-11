import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Small progress is still progress.", author: "Unknown" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { text: "You are capable of more than you know.", author: "Glinda" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
];

export function MotivationalQuote() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Set random quote on mount
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const getNewQuote = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * QUOTES.length);
    } while (newIndex === quoteIndex && QUOTES.length > 1);
    setQuoteIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const quote = QUOTES[quoteIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/20"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Quote className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-foreground italic leading-relaxed">
                "{quote.text}"
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                — {quote.author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={getNewQuote}
          disabled={isAnimating}
        >
          <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </motion.div>
  );
}
