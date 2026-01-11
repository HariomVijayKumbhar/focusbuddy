import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContext {
  inSession?: boolean;
  sessionMinutesRemaining?: number;
  todayStats?: {
    sessionsCompleted: number;
    focusMinutes: number;
    streak: number;
  };
  userGoal?: number;
}

export function useFocusBuddyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/focusbuddy-chat`;

  const sendMessage = useCallback(async (input: string, context?: ChatContext) => {
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg],
          context,
        }),
      });

      if (resp.status === 429) {
        toast({
          title: "Slow down",
          description: "Too many messages. Take a breath and try again in a moment.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (resp.status === 402) {
        toast({
          title: "Credits needed",
          description: "AI credits are depleted. Please add more credits to continue.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to connect to FocusBuddy');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      const upsertAssistant = (nextChunk: string) => {
        assistantSoFar += nextChunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: 'assistant', content: assistantSoFar }];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Connection issue",
        description: "Couldn't reach FocusBuddy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast, CHAT_URL]);

  const clearMessages = () => setMessages([]);

  const addWelcomeMessage = (userName?: string) => {
    const greeting = userName ? `Hey ${userName}!` : 'Hey there!';
    setMessages([{
      role: 'assistant',
      content: `${greeting} 👋 I'm FocusBuddy, your study companion. How can I help you stay focused today?`,
    }]);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    addWelcomeMessage,
  };
}
