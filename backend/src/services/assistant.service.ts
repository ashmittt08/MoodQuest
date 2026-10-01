/**
 * AI companion reply generation.
 *
 * Phase 1 ships a small rule-based placeholder so the full chat pipeline
 * (React → Express → PostgreSQL → reply) works end to end. Phase 2 replaces it
 * with an LLM provider implementing the same `AssistantProvider` interface,
 * selected via the ASSISTANT_PROVIDER setting.
 */
import { env } from "../config/env.ts";
import type { Message } from "../generated/prisma/client.ts";

export const DEFAULT_SUGGESTIONS = ["I want to relax", "Motivate me", "Talk about my day"];

export interface AssistantReply {
  content: string;
  suggestions: string[];
}

export interface AssistantProvider {
  name: string;
  greeting(userName: string): AssistantReply;
  reply(input: { userName: string; history: Message[]; message: string }): Promise<AssistantReply> | AssistantReply;
}

interface Intent {
  name: string;
  patterns: RegExp[];
  responses: string[];
  suggestions: string[];
}

function supportMessage(): string {
  return (
    "I'm really glad you told me. What you're feeling matters, and you deserve support right now " +
    `from a real person. Please reach out to ${env.HELPLINE_NAME} at ${env.HELPLINE_NUMBER} ` +
    `(${env.HELPLINE_AVAILABILITY.toLowerCase()}), or call ${env.EMERGENCY_NUMBER} if you are in immediate danger. ` +
    "You can also open the Emergency page in MoodQuest to contact someone you trust."
  );
}

// Ordered by priority: the first matching intent wins.
const INTENTS: Intent[] = [
  {
    name: "support",
    patterns: [/suicid/, /kill myself/, /end my life/, /want to die/, /self[- ]?harm/, /hurt myself/, /don'?t want to live/, /no reason to live/],
    responses: [], // built from configuration
    suggestions: ["Open emergency help", "Talk to me", "I want to relax"],
  },
  {
    name: "stress",
    patterns: [/stress/, /pressure/, /overwhelm/, /exam/, /deadline/, /college/, /future/, /burn ?out/, /workload/],
    responses: [
      "I understand, it's completely normal to feel this way. You're not alone. Would you like to try a breathing exercise or listen to some calming music?",
      "That sounds like a lot to carry. Let's take it one step at a time — what feels most pressing right now? A 5-minute breathing exercise can also help reset your mind.",
    ],
    suggestions: ["Try a breathing exercise", "Play calming music", "Talk about it"],
  },
  {
    name: "anxiety",
    patterns: [/anxi/, /nervous/, /panic/, /worr/, /scared/, /afraid/, /\bfear/],
    responses: [
      "Anxiety can feel really intense, but it does pass. Try this with me: breathe in for 4, hold for 4, out for 4. Would you like a guided box-breathing session?",
      "It's okay to feel anxious — your body is trying to protect you. Naming what worries you can make it feel smaller. What's on your mind?",
    ],
    suggestions: ["Start box breathing", "What's worrying me", "Play calming music"],
  },
  {
    name: "sad",
    patterns: [/\bsad\b/, /\bdown\b/, /lonely/, /alone/, /depress/, /\bcry/, /unhappy/, /heartbroken/, /\bupset/],
    responses: [
      "I'm sorry you're feeling this way. Your feelings are valid, and it's okay to not be okay. Would you like to talk about what's been going on?",
      "Thank you for sharing that with me. Sometimes a comforting movie or writing in your journal can help. I'm here to listen too.",
    ],
    suggestions: ["Talk about it", "Suggest a comfort movie", "Write in my journal"],
  },
  {
    name: "angry",
    patterns: [/angry/, /\bmad\b/, /furious/, /frustrat/, /annoy/, /irritat/, /\brage/],
    responses: [
      "It sounds like something really got to you. Anger is a normal emotion — let's give it somewhere safe to go. A quick round of Stress Burst or a few slow breaths might help.",
      "That's frustrating. Want to tell me what happened? Sometimes getting it out helps.",
    ],
    suggestions: ["Play Stress Burst", "Tell you what happened", "Try a breathing exercise"],
  },
  {
    name: "sleep",
    patterns: [/sleep/, /tired/, /insomnia/, /exhaust/, /can'?t rest/],
    responses: [
      "Rest is so important for how we feel. A sleep meditation or some soft piano before bed can help your mind wind down. Want me to suggest one?",
    ],
    suggestions: ["Sleep meditation", "Play calm piano", "Talk about my day"],
  },
  {
    name: "relax",
    patterns: [/relax/, /calm down/, /breath/, /\bchill/, /unwind/],
    responses: [
      "Let's slow things down. Try the 5 Min Breathing Exercise in Meditation, or put on the Lo-Fi Chill playlist. Which sounds better right now?",
    ],
    suggestions: ["Try a breathing exercise", "Play Lo-Fi Chill", "Play a relaxing game"],
  },
  {
    name: "motivate",
    patterns: [/motivat/, /lazy/, /procrastinat/, /give up/, /can'?t do/, /stuck/],
    responses: [
      "You've already taken a step just by reaching out. Pick one tiny task you can finish in five minutes — momentum builds from small wins. You've got this!",
      "Progress, not perfection. Every small step counts, and you're more capable than you think. What's one thing you'd like to get done today?",
    ],
    suggestions: ["Set a small goal", "Play a focus game", "Talk about my day"],
  },
  {
    name: "day",
    patterns: [/my day/, /today was/, /today i/],
    responses: ["I'd love to hear about it! What was the best part of your day, and was there anything that felt hard?"],
    suggestions: ["The best part", "Something hard", "Write in my journal"],
  },
  {
    name: "happy",
    patterns: [/happy/, /great/, /\bgood\b/, /awesome/, /excited/, /grateful/, /amazing/],
    responses: [
      "That's wonderful to hear! What made today feel good? Noting it in your journal can help you remember these moments.",
    ],
    suggestions: ["Write in my journal", "Play a fun game", "Talk about my day"],
  },
  {
    name: "thanks",
    patterns: [/thank/, /\bthx\b/],
    responses: ["You're very welcome. I'm always here whenever you need to talk."],
    suggestions: DEFAULT_SUGGESTIONS,
  },
  {
    name: "greeting",
    patterns: [/^\s*(hi|hello|hey|hii+|yo)\b/],
    responses: ["Hi there! How are you feeling right now?"],
    suggestions: ["I'm feeling good", "I'm feeling stressed", "Talk about my day"],
  },
];

const FALLBACK_RESPONSES = [
  "I hear you. Tell me a bit more about how that makes you feel?",
  "Thank you for sharing. I'm here to listen — what's been on your mind the most?",
];

const pick = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/** Keyword-matching placeholder. Not an AI model and not a risk classifier. */
export class RuleBasedAssistant implements AssistantProvider {
  name = "rule_based";

  greeting(userName: string): AssistantReply {
    const firstName = userName.trim().split(/\s+/)[0] || "there";
    return { content: `Hey ${firstName} 👋\nHow are you feeling today?`, suggestions: [...DEFAULT_SUGGESTIONS] };
  }

  reply({ message }: { message: string }): AssistantReply {
    const text = message.toLowerCase();
    for (const intent of INTENTS) {
      if (intent.patterns.some((pattern) => pattern.test(text))) {
        const content = intent.name === "support" ? supportMessage() : pick(intent.responses);
        return { content, suggestions: [...intent.suggestions] };
      }
    }
    return { content: pick(FALLBACK_RESPONSES), suggestions: [...DEFAULT_SUGGESTIONS] };
  }
}

export function getAssistantProvider(): AssistantProvider {
  // Phase 2: return an LLM-backed provider when env.ASSISTANT_PROVIDER says so.
  return new RuleBasedAssistant();
}
