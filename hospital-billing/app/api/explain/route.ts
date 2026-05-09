import { NextRequest, NextResponse } from 'next/server';

// ── Guardrail constants ────────────────────────────────────────────────
const MAX_INPUT_LENGTH = 120;
const MAX_OUTPUT_TOKENS = 220;
const ALLOWED_CHARS = /^[a-zA-Z0-9\s\-\/().,&']+$/;

const SYSTEM_PROMPT = `You are a hospital billing assistant that helps patients understand medical charges on their bill.
Your ONLY job is to explain medical procedures, medicines, or hospital charges in simple, jargon-free language that any patient can understand.
Rules you MUST follow:
1. Keep your answer to 2-3 sentences maximum.
2. Never give medical advice, diagnoses, or treatment recommendations.
3. If the input is not a medical procedure, medicine, room charge, or hospital service, reply with: "This item is a standard hospital billing charge."
4. Do not discuss anything outside of hospital billing explanations.
5. Always end with "If you have questions about this charge, please speak to the billing desk."`;

const FALLBACK_EXPLANATION =
  'This is a standard hospital billing item. The charge covers the service provided during your treatment. If you have questions about this charge, please speak to the billing desk.';

// ── Input sanitizer ────────────────────────────────────────────────────
function sanitizeProcedureName(raw: string): string | null {
  const trimmed = raw.trim().slice(0, MAX_INPUT_LENGTH);
  const stripped = trimmed.replace(/<[^>]*>/g, '').trim();
  if (!stripped || stripped.length < 2) return null;
  if (!ALLOWED_CHARS.test(stripped)) {
    return stripped.replace(/[^a-zA-Z0-9\s\-\/().,&']/g, '').trim() || null;
  }
  return stripped;
}

// ── Models to try in priority order ───────────────────────────────────
const FREE_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'openai/gpt-oss-20b:free',
  'google/gemma-4-26b-a4b-it:free',
];

async function callOpenRouter(procedure: string): Promise<{ explanation: string; error?: string }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn('[explain] OPENROUTER_API_KEY not set');
    return { explanation: FALLBACK_EXPLANATION, error: 'API key not configured' };
  }

  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'BillClear Hospital Billing',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Explain this hospital billing item in simple language for a patient: "${procedure}"`,
            },
          ],
          max_tokens: MAX_OUTPUT_TOKENS,
          temperature: 0.3,
        }),
      });

      if (response.status === 429) {
        console.warn(`[explain] Rate limited on ${model}, trying next model`);
        continue;
      }

      if (response.status === 404) {
        console.warn(`[explain] Model not found: ${model}, trying next`);
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[explain] Error ${response.status} from ${model}:`, errText);
        continue;
      }

      const data = await response.json();
      const raw: string = data?.choices?.[0]?.message?.content ?? '';

      if (!raw.trim()) {
        console.warn(`[explain] Empty response from ${model}`);
        continue;
      }

      const explanation = raw.trim().slice(0, 600);
      console.log(`[explain] Success using model: ${model}`);
      return { explanation };

    } catch (err) {
      console.error(`[explain] Network error on ${model}:`, err);
      continue;
    }
  }

  return {
    explanation: FALLBACK_EXPLANATION,
    error: 'AI models are currently rate-limited.',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawProcedure = typeof body?.procedure === 'string' ? body.procedure : '';
    const procedure = sanitizeProcedureName(rawProcedure);

    if (!procedure) {
      return NextResponse.json({ explanation: FALLBACK_EXPLANATION });
    }

    const result = await callOpenRouter(procedure);
    return NextResponse.json(result);

  } catch (error) {
    console.error('[explain] Unexpected error:', error);
    return NextResponse.json({ explanation: FALLBACK_EXPLANATION });
  }
}
