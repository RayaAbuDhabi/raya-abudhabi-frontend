// app/api/chat/route.ts
// API route with offline fallback

import { NextRequest, NextResponse } from 'next/server';
import offlineEngine from '@/lib/services/offlineEngine';

export async function POST(request: NextRequest) {
  try {
    const { query, conversationHistory } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    // Get Claude API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Try online API first if key is available
    if (apiKey) {
      try {
        const onlineResponse = await getOnlineResponse(query, conversationHistory, apiKey);
        return NextResponse.json(onlineResponse);
      } catch (error) {
        console.warn('Online API failed, falling back to offline:', error);
        // Fall through to offline mode
      }
    }

    // Use offline engine
    const result = await offlineEngine.processQuery(query);

    if (result && result.confidence > 0) {
      return NextResponse.json({
        answer: result.answer,
        confidence: result.confidence,
        source: 'offline',
        relatedQuestions: result.relatedQuestions || getRelatedQuestions(query),
        category: result.category
      });
    } else {
      return NextResponse.json({
        answer: "I don't have information about that. Please ask about airport facilities, terminals, check-in, baggage, or transportation.",
        confidence: 0,
        source: 'offline',
        relatedQuestions: [
          "What are the airport operating hours?",
          "Where is Etihad Airways check-in?",
          "How do I get to downtown Abu Dhabi?"
        ]
      });
    }

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get response from Claude API (online mode)
async function getOnlineResponse(query: string, conversationHistory: any[], apiKey: string) {
  const airportInfo = offlineEngine.kb.airport;
  const terminals = offlineEngine.kb.terminals;
  
  const systemPrompt = `You are Raya, an AI assistant for ${airportInfo.name} (${airportInfo.code}).

AIRPORT INFORMATION:
- Location: ${airportInfo.city}, ${airportInfo.country}
  Number of Terminals: ${terminals.lengt
- Timezone: ${airportInfo.timezone}

TERMINALS:
${JSON.stringify(terminals, null, 2)}

GUIDELINES:
- Provide accurate, concise information about the airport
- Be helpful and friendly
- If asked about locations, specify terminal and gate numbers
- For Arabic queries, respond in Arabic
- Always prioritize passenger safety and convenience
- Keep responses brief (2-3 sentences max)
- Suggest 1-2 related questions when helpful

Current context: ${conversationHistory?.length > 0 ? 'Continuing conversation' : 'New conversation'}`;

  const messages = [
    ...(conversationHistory || []),
    { role: 'user', content: query }
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: systemPrompt,
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const data = await response.json();
  const answer = data.content[0]?.text || 'I apologize, but I could not generate a response.';

  return {
    answer,
    source: 'online',
    model: data.model,
    usage: data.usage
  };
}

// Get related questions based on query
function getRelatedQuestions(query: string): string[] {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('check') || queryLower.includes('counter')) {
    return [
      "How early should I arrive before my flight?",
      "Where is the baggage claim?"
    ];
  }
  
  if (queryLower.includes('food') || queryLower.includes('eat') || queryLower.includes('restaurant')) {
    return [
      "Is there free WiFi at the airport?",
      "Where can I find a lounge?"
    ];
  }
  
  if (queryLower.includes('taxi') || queryLower.includes('transport') || queryLower.includes('downtown')) {
    return [
      "Where is the taxi stand?",
      "How much does a taxi to downtown cost?"
    ];
  }
  
  if (queryLower.includes('wifi') || queryLower.includes('internet')) {
    return [
      "Where can I charge my phone?",
      "Is there a business center?"
    ];
  }

  // Default suggestions
  return [
    "What are the airport operating hours?",
    "Where can I exchange currency?",
    "Are there prayer rooms available?"
  ];
}

// OPTIONS method for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}