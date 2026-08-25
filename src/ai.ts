interface SuggestionResponse {
  suggestions?: unknown;
  source?: unknown;
  error?: unknown;
}

export interface SuggestionResult {
  suggestions: string[];
  source: 'ai' | 'demo';
}

export async function fetchFollowUps(task: string): Promise<SuggestionResult> {
  const response = await fetch('/.netlify/functions/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task }),
  });

  let data: SuggestionResponse;
  try {
    data = await response.json();
  } catch {
    throw new Error('The task was added, but the suggestion service returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(
      typeof data.error === 'string'
        ? data.error
        : 'The task was added, but suggestions are unavailable.'
    );
  }

  if (
    !Array.isArray(data.suggestions) ||
    !data.suggestions.every((suggestion) => typeof suggestion === 'string')
  ) {
    throw new Error('The task was added, but the suggestion service returned an invalid response.');
  }

  return {
    suggestions: data.suggestions,
    source: data.source === 'demo' ? 'demo' : 'ai',
  };
}
