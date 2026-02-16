/**
 * AI Client
 *
 * Thin wrapper around the OpenAI Chat Completions API (compatible with
 * GPT-3.5/4, or any OpenAI-compatible endpoint). Falls back to a static
 * mock when OPENAI_API_KEY is not set.
 */

import { logger } from "./monitoring";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AIChatOptions {
  messages: ChatMessage[];
  /** Max tokens in the response (default 1024) */
  maxTokens?: number;
  /** Temperature 0-2 (default 0.7) */
  temperature?: number;
}

interface AIChatResult {
  reply: string;
  /** Whether the response came from the real AI or a mock */
  mock: boolean;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const OPENAI_API_KEY = () => process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = () =>
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = () => process.env.OPENAI_MODEL || "gpt-3.5-turbo";

// Simple in-memory rate limiter: userId → [timestamps]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // max requests per window

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(userId) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false; // rate limited
  }
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

// ---------------------------------------------------------------------------
// Content moderation (basic keyword filter)
// ---------------------------------------------------------------------------

const BLOCKED_PATTERNS = [
  /\b(hack|exploit|attack|steal|phish)\b.*\b(wallet|contract|key|seed|phrase)\b/i,
  /\b(private\s*key|seed\s*phrase|mnemonic)\b/i,
];

export function sanitizeInput(message: string): string {
  // Strip control characters
  return message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

export function isInputSafe(message: string): boolean {
  return !BLOCKED_PATTERNS.some((p) => p.test(message));
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are the eth.ed AI Learning Assistant — a helpful, concise tutor for blockchain and Ethereum education.

Guidelines:
- Answer questions about Ethereum, EIPs, smart contracts, Web3, blockchain fundamentals, and related topics.
- Be accurate, cite EIP numbers or relevant specs when possible.
- Keep responses focused and educational — avoid speculation about token prices.
- If asked about something outside blockchain education, politely redirect the conversation.
- Never share, ask for, or discuss private keys, seed phrases, or wallet credentials.
- Format responses in markdown when helpful (code blocks, lists, headers).`;

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

export async function chatCompletion(
  opts: AIChatOptions
): Promise<AIChatResult> {
  const apiKey = OPENAI_API_KEY();

  if (!apiKey) {
    logger.debug(
      "OPENAI_API_KEY not set — returning mock AI response",
      "ai-client"
    );
    return { reply: mockReply(opts.messages), mock: true };
  }

  try {
    const baseUrl = OPENAI_BASE_URL();
    const model = OPENAI_MODEL();

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...opts.messages],
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      logger.error(
        `OpenAI API error: ${res.status}`,
        "ai-client",
        { status: res.status, body: text }
      );
      // Graceful degradation: fall back to mock
      return { reply: mockReply(opts.messages), mock: true };
    }

    const data = await res.json();
    const content =
      data.choices?.[0]?.message?.content?.trim() || mockReply(opts.messages);

    return { reply: content, mock: false };
  } catch (error) {
    logger.error("AI chat completion failed", "ai-client", {}, error);
    // Graceful degradation
    return { reply: mockReply(opts.messages), mock: true };
  }
}

// ---------------------------------------------------------------------------
// Mock fallback
// ---------------------------------------------------------------------------

function mockReply(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.content || "";
  return `I understand you asked: "${lastMessage.slice(0, 120)}". I'm your eth.ed learning assistant! I can help you with blockchain concepts, smart contracts, and Web3 fundamentals. (Note: AI backend not configured — set OPENAI_API_KEY for real responses.)`;
}
