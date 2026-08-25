// netlify/functions/suggest.ts
import type { Handler } from '@netlify/functions';
import OpenAI from 'openai';
import { MAX_TASK_LENGTH } from '../../types';

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...jsonHeaders, Allow: 'POST' },
      body: JSON.stringify({ error: 'Method not allowed.' }),
    };
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Request body must be valid JSON.' }),
    };
  }

  const task =
    isRecord(body) && typeof body.task === 'string' ? body.task.trim() : '';

  if (!task) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'Enter a task before requesting suggestions.' }),
    };
  }

  if (task.length > MAX_TASK_LENGTH) {
    return {
      statusCode: 400,
      headers: jsonHeaders,
      body: JSON.stringify({
        error: `Tasks must be ${MAX_TASK_LENGTH} characters or fewer.`,
      }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({
        suggestions: createDemoSuggestions(task),
        source: 'demo',
      }),
    };
  }

  try {
    const openai = new OpenAI({
      apiKey,
      project: process.env.OPENAI_PROJECT_ID || undefined,
      baseURL: process.env.AI_BASE_URL || undefined,
    });
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.8,
      max_tokens: 180,
      messages: [
        {
          role: 'system',
          content:
            'Suggest exactly three concise follow-up tasks. Return only one task per line without numbering.',
        },
        { role: 'user', content: `Task: ${task}` },
      ],
    });
    const suggestions = parseSuggestions(
      completion.choices[0]?.message?.content || ''
    );

    if (suggestions.length === 0) {
      return {
        statusCode: 502,
        headers: jsonHeaders,
        body: JSON.stringify({ error: 'AI suggestions are unavailable right now.' }),
      };
    }

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: JSON.stringify({ suggestions, source: 'ai' }),
    };
  } catch (error) {
    console.error(
      'Suggestion provider request failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return {
      statusCode: 502,
      headers: jsonHeaders,
      body: JSON.stringify({ error: 'AI suggestions are unavailable right now.' }),
    };
  }
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseSuggestions(content: string): string[] {
  const suggestions = content
    .split('\n')
    .map((suggestion) =>
      suggestion.replace(/^\s*(?:[-*]|\d+[.)])\s*/, '').trim()
    )
    .filter(Boolean)
    .map((suggestion) => suggestion.slice(0, MAX_TASK_LENGTH));

  return Array.from(new Set(suggestions)).slice(0, 3);
}

function createDemoSuggestions(task: string): string[] {
  const subject = task.replace(/[.!?]+$/, '');
  return [
    `Clarify acceptance criteria for ${subject}`,
    `Break ${subject} into implementation steps`,
    `Review and validate ${subject}`,
  ].map((suggestion) => suggestion.slice(0, MAX_TASK_LENGTH));
}
