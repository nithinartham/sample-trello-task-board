import { fetchFollowUps } from './ai';

describe('fetchFollowUps', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });
  });

  afterAll(() => {
    Object.defineProperty(global, 'fetch', {
      configurable: true,
      writable: true,
      value: originalFetch,
    });
  });

  it('returns validated suggestions and their source', async () => {
    mockFetchResponse({
      ok: true,
      data: {
        suggestions: ['Define scope', 'Implement feature', 'Review work'],
        source: 'demo',
      },
    });

    await expect(fetchFollowUps('Build feature')).resolves.toEqual({
      suggestions: ['Define scope', 'Implement feature', 'Review work'],
      source: 'demo',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      '/.netlify/functions/suggest',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ task: 'Build feature' }),
      })
    );
  });

  it('surfaces a public API error', async () => {
    mockFetchResponse({
      ok: false,
      data: { error: 'Suggestions are temporarily unavailable.' },
    });

    await expect(fetchFollowUps('Build feature')).rejects.toThrow(
      'Suggestions are temporarily unavailable.'
    );
  });

  it('rejects malformed suggestion data', async () => {
    mockFetchResponse({
      ok: true,
      data: { suggestions: 'not-an-array', source: 'demo' },
    });

    await expect(fetchFollowUps('Build feature')).rejects.toThrow(
      'suggestion service returned an invalid response'
    );
  });
});

function mockFetchResponse({
  ok,
  data,
}: {
  ok: boolean;
  data: unknown;
}) {
  const fetchMock = global.fetch as jest.MockedFunction<typeof fetch>;
  fetchMock.mockResolvedValue({
    ok,
    json: async () => data,
  } as Response);
}
