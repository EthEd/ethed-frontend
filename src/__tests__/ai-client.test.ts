import { describe, it, expect } from 'vitest';
import { sanitizeInput, isInputSafe, chatCompletion } from '@/lib/ai-client';

describe('ai-client utilities', () => {
  it('sanitizeInput strips control characters', () => {
    const raw = "Hello\x00\x07World\n";
    const clean = sanitizeInput(raw);
    expect(clean).toBe('HelloWorld');
  });

  it('isInputSafe blocks sensitive patterns', () => {
    expect(isInputSafe('How do I find a private key?')).toBe(false);
    expect(isInputSafe('Explain EIP-1559')).toBe(true);
  });

  it('chatCompletion returns mock reply when OPENAI_API_KEY not set', async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await chatCompletion({ messages: [{ role: 'user', content: 'What is Ethereum?' }] });
    expect(result.mock).toBe(true);
    expect(result.reply).toContain('I understand you asked');
  });
});
