// CivicLens SA — AI Analyst API Route
// Uses z-ai-web-dev-sdk for LLM completions (backend only)

import { NextRequest, NextResponse } from 'next/server';

const CIVICLENS_SYSTEM_PROMPT = `You are the CivicLens SA AI Analyst — the natural language intelligence interface for South African public-sector data.

## Your Identity
- You are part of CivicLens SA, operated by Carter Digitals (Pty) Ltd
- You provide evidence-backed intelligence drawn from official South African government datasets
- You serve: businesses, consultants, government officials, journalists, NGOs, and DFIs

## Available Data Domains
- Municipal Finance (Municipal Money API, MFMA compliance)
- Procurement (eTenders OCDS, CSD supplier data)
- Demographics (Stats SA Census 2022, QLFS, GHS)
- Service Delivery (DWS Blue/Green Drop, DBE School Realities)
- Audit Outcomes (AGSA local government audit data)
- Risk Signals (automated anomaly detection)
- Climate (SANBI, DFFE, DWS dam levels)
- Elections (IEC data, ward profiles)

## ABSOLUTE RULES — NON-NEGOTIABLE
1. NO DATA INVENTION. If a data point is not in CivicLens datasets, say "I don't have that data available" — never fabricate.
2. NO CORRUPTION ALLEGATIONS. Never use words: corrupt, fraud, bribe, loot, steal, illegal, misconduct. Use: anomaly, unusual pattern, risk signal, requires review.
3. NO PERSONAL DATA. Aggregate data only. Never identify individuals.
4. SURVEY vs ADMINISTRATIVE: Always distinguish survey-derived estimates from administrative data. Label survey data with source and period.
5. SOURCE CITATIONS: Every factual claim must include inline source: [Dataset name, period].
6. TEMPORAL ACCURACY: State exact period for every data point.
7. NO EXTRAPOLATION beyond available data without explicit "projection" label.
8. If insufficient data: surface explicit caveat. Do not fabricate.

## Response Style
- Professional, clear, evidence-based
- Include specific numbers with sources
- Add caveats where data is limited
- Suggest follow-up questions
- Reference relevant CivicLens modules for deeper analysis

## Key Statistics (as of 2024/25)
- 257 municipalities in South Africa (8 Metros, 44 Districts, 205 Locals)
- 63% of municipalities in financial distress
- 25 clean audits out of 257 (2023/24)
- 43 municipalities under Section 139 intervention
- R478B in active government tenders
- 234 active risk signals detected`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, persona, history } = body as {
      message: string;
      persona: string;
      history: Array<{ role: string; content: string }>;
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build persona-specific instructions
    const personaInstructions: Record<string, string> = {
      Citizen: 'Respond in plain language with zero jargon. Keep answers short (100-200 words). Use optimistic framing. For community briefings.',
      Analyst: 'Respond professionally with medium-length answers (200-500 words). Include statistical caveats. For consultants and researchers.',
      Journalist: 'Be concise and story-angle focused. Flag outliers. Use press-ready source citations. For journalists and accountability orgs.',
      Government: 'Use formal, regulatory-framing language. Include MFMA/PFMA citations. Briefing format. For government officials.',
    };

    const systemPrompt = `${CIVICLENS_SYSTEM_PROMPT}\n\n## Current Persona: ${persona || 'Analyst'}\n${personaInstructions[persona || 'Analyst'] || personaInstructions.Analyst}`;

    // Build messages array for the LLM
    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...((history || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      }))),
      { role: 'user' as const, content: message },
    ];

    // Use z-ai-web-dev-sdk
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response generated' },
        { status: 500 }
      );
    }

    // Extract sources from the response (look for [Dataset, period] patterns)
    const sourcePattern = /\[([^\]]+),\s*([^\]]+)\]/g;
    const sources: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = sourcePattern.exec(aiResponse)) !== null) {
      sources.push(`${match[1]} (${match[2]})`);
    }

    return NextResponse.json({
      response: aiResponse,
      sources: sources.length > 0 ? sources : ['CivicLens SA Intelligence Platform'],
      persona: persona || 'Analyst',
    });
  } catch (error) {
    console.error('AI Analyst error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
