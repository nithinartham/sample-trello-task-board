import type {
  HandlerContext,
  HandlerEvent,
  HandlerResponse,
} from '@netlify/functions';
import { handler } from './suggest';

describe('suggest function', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterAll(() => {
    if (originalApiKey) {
      process.env.OPENAI_API_KEY = originalApiKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it('rejects unsupported methods', async () => {
    const response = await invoke({ httpMethod: 'GET' });

    expect(response.statusCode).toBe(405);
    expect(response.headers).toEqual(
      expect.objectContaining({ Allow: 'POST' })
    );
  });

  it('rejects malformed JSON', async () => {
    const response = await invoke({ body: '{not-json' });

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body || '{}')).toEqual({
      error: 'Request body must be valid JSON.',
    });
  });

  it('rejects missing task text', async () => {
    const response = await invoke({ body: JSON.stringify({ task: '   ' }) });

    expect(response.statusCode).toBe(400);
  });

  it('returns three labeled offline suggestions without a provider key', async () => {
    const response = await invoke({
      body: JSON.stringify({ task: 'Build responsive navigation' }),
    });
    const body = JSON.parse(response.body || '{}');

    expect(response.statusCode).toBe(200);
    expect(body.source).toBe('demo');
    expect(body.suggestions).toHaveLength(3);
    expect(body.suggestions).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Build responsive navigation'),
      ])
    );
  });
});

async function invoke(
  overrides: Partial<HandlerEvent>
): Promise<HandlerResponse> {
  const event: HandlerEvent = {
    rawUrl: 'http://localhost/.netlify/functions/suggest',
    rawQuery: '',
    path: '/.netlify/functions/suggest',
    httpMethod: 'POST',
    headers: {},
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    body: JSON.stringify({ task: 'Test task' }),
    isBase64Encoded: false,
    ...overrides,
  };
  const response = await handler(event, {} as HandlerContext);

  if (!response) {
    throw new Error('Expected the function to return a response.');
  }
  return response;
}
