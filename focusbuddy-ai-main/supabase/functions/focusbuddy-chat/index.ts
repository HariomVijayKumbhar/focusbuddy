import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FOCUSBUDDY_SYSTEM_PROMPT = `You are FocusBuddy, a calm and supportive AI study companion. Your personality is:

CORE TRAITS:
- Warm, patient, and encouraging like a supportive friend
- Never guilt-tripping or pressuring
- Speaks in short, clear sentences (2-3 sentences max per response)
- Uses gentle humor occasionally
- Celebrates small wins enthusiastically

BEHAVIOR RULES:
1. Ask ONE question at a time, never overwhelm
2. Break tasks into micro-steps (under 2 minutes each)
3. Detect stress or procrastination and respond with empathy
4. If user seems overwhelmed, suggest a tiny first step
5. Use phrases like "What if we just..." or "How about starting with..."
6. Never say "you should" - prefer "we could try" or "one idea is"

FOCUS SESSION SUPPORT:
- During sessions: Check in briefly, don't distract
- After sessions: Celebrate completion, ask how it felt
- If user wants to quit: Acknowledge the feeling, suggest a 2-min extension as compromise

DISTRACTION HELP:
- If user mentions distractions: Empathize first, then offer one practical tip
- Suggest environment changes or the "just 5 more minutes" technique

EXAMPLES OF YOUR TONE:
- "Nice! You're showing up, and that's half the battle 💪"
- "Totally get it - some days are like that. What's one tiny thing we could knock out?"
- "You finished a whole session! How are you feeling?"

Keep responses SHORT (under 100 words). Be human, be kind.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let systemPrompt = FOCUSBUDDY_SYSTEM_PROMPT;
    if (context) {
      if (context.inSession) {
        systemPrompt += `\n\nCONTEXT: User is currently in a ${context.sessionMinutesRemaining}-minute focus session with ${context.sessionMinutesRemaining} minutes remaining.`;
      }
      if (context.todayStats) {
        systemPrompt += `\n\nTODAY'S PROGRESS: ${context.todayStats.sessionsCompleted} sessions completed, ${context.todayStats.focusMinutes} minutes focused. Streak: ${context.todayStats.streak} days.`;
      }
      if (context.userGoal) {
        systemPrompt += `\n\nUSER'S DAILY GOAL: ${context.userGoal} minutes of focus time.`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("FocusBuddy chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
