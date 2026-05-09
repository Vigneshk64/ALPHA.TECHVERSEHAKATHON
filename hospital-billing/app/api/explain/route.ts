import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { procedure } = await req.json();

    if (!procedure) {
      return NextResponse.json(
        { error: 'Procedure name is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-2-27b-it:free',
        messages: [
          {
            role: 'user',
            content: `Explain the following medical procedure in simple, easy-to-understand language for someone without medical knowledge. Avoid all medical jargon. Keep it to 2-3 sentences.\n\nProcedure: ${procedure}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return NextResponse.json(
        { error: 'Failed to get explanation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const explanation = data.choices[0].message.content;

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
