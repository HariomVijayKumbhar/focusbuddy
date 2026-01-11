import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireConfetti = useCallback((type: 'session' | 'goal' | 'streak' | 'badge' = 'session') => {
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    switch (type) {
      case 'session':
        // Simple celebration for completing a session
        confetti({
          ...defaults,
          particleCount: 80,
          spread: 60,
          colors: ['#4ade80', '#22c55e', '#16a34a'],
        });
        break;

      case 'goal':
        // Bigger celebration for goal completion
        const count = 150;
        const defaults2 = {
          origin: { y: 0.6 },
          zIndex: 9999,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
          confetti({
            ...defaults2,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        }

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
        break;

      case 'streak':
        // Fire effect for streaks
        const duration = 2000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            clearInterval(interval);
            return;
          }

          const particleCount = 40 * (timeLeft / duration);
          confetti({
            ...defaults,
            particleCount,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: ['#f97316', '#fb923c', '#fdba74'],
          });
          confetti({
            ...defaults,
            particleCount,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: ['#f97316', '#fb923c', '#fdba74'],
          });
        }, 200);
        break;

      case 'badge':
        // Star burst for new badge
        const shapes: confetti.Shape[] = ['star', 'circle'];
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 360,
          startVelocity: 30,
          decay: 0.9,
          shapes,
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#a855f7', '#8b5cf6'],
        });
        break;
    }
  }, []);

  return { fireConfetti };
}
