# Development Documentation

## Implementation summary

The starter scaffold was completed as an accessible, responsive four-column task
board. Users can add trimmed tasks to Todo, move them through each workflow state,
and delete them. Each task has a Fibonacci effort estimate, and each column shows
its aggregate points. Tasks can be dragged directly between columns, while
boundary-aware movement buttons remain available for keyboard users. Work items
can be classified as Bugs, Stories, or Tasks.

AI suggestions are implemented as an opt-in progressive enhancement. The core
board remains available when no provider is configured or a provider request
fails. Without credentials, deterministic suggestions are available and clearly
labeled as an offline demo; they are never represented as AI output. The Netlify
function supports OpenAI and OpenAI-compatible public providers through
environment configuration.

## AI tooling used

GitHub Copilot CLI was used during development to:

- Review `README.md`, `SETUP_GUIDE.md`, `INSTRUCTIONS.md`, and the starter files.
- Translate the requirements into component behavior and public-facing quality
  considerations.
- Implement React state management, accessible component markup, SCSS, the typed
  API client, and the Netlify function.
- Identify edge cases including empty input, movement boundaries, malformed JSON,
  missing provider configuration, invalid provider responses, and duplicate AI
  suggestions.
- Draft focused React Testing Library coverage and this documentation.

All generated changes were reviewed against the repository's types, component
boundaries, and assignment checklist. No credentials or private data were
provided to the AI tooling or added to the repository.

## Engineering decisions

### Accessibility

- Semantic headings, sections, articles, and form labels describe the interface.
- Every icon-only task action has a task-specific accessible name.
- Disabled movement controls communicate workflow boundaries.
- Keyboard focus follows a moved card, status changes use polite live regions,
  and controls meet practical touch-target sizes.
- Motion is reduced when the operating system requests reduced motion.

### Responsive design

The board is mobile-first: one column on small screens, two on tablets, and four
on desktop. Long task text wraps rather than overflowing, and the task form stacks
on narrow screens.

### Effort points

Task creation includes a constrained Fibonacci selector with 1, 2, 3, 5, 8, and
13 points. The selected estimate travels with the task across workflow states.
Cards expose their estimate to assistive technology, and column headers aggregate
the total effort currently in each state.

### Work item types

The creation form includes Task, Story, and Bug classifications. Cards retain
their type as they move and use text plus color-coded badges, so meaning does not
depend on color alone. Manual work-item creation is unlimited; only generated
follow-up suggestions are capped at three per request.

### Drag and drop

Cards use the browser's native drag-and-drop API, avoiding an additional runtime
dependency. Columns validate the custom task identifier before accepting a drop,
then use the same state transition and announcement path as button-based moves.
Accessible move buttons remain the primary keyboard alternative.

### State and identifiers

Task state remains local to `TaskBoardComponent`, matching the requested
architecture. A monotonic numeric identifier seeded from the current time avoids
collisions when several tasks are added in the same millisecond.

Tasks persist in browser `localStorage` under a versioned key. Restored data is
validated against the task states, work-item types, point scale, title length,
and identifier shape before it enters React state. Corrupt or unavailable
storage is reported to the console while the board continues with empty,
in-memory state.

### AI integration and security

- Provider access occurs only in the Netlify function; credentials never enter
  the browser bundle.
- AI is explicitly opt-in to avoid unexpected requests and provider costs.
- Missing provider credentials activate a clearly labeled, deterministic offline
  demonstration rather than borrowing or embedding an insecure shared key.
- The server validates method, JSON syntax, task type, whitespace, and length.
- Provider details can be configured with `OPENAI_API_KEY`,
  `OPENAI_PROJECT_ID`, `AI_BASE_URL`, and `AI_MODEL`.
- Public responses are actionable but do not expose provider internals.
- Responses are marked `no-store`, parsed defensively, deduplicated, and limited
  to three task-length suggestions.

## Running locally

1. Run `npm install`.
2. Run `npm start` for the core board, or create an ignored `.env` and run
   `npm run dev` for Netlify Functions.
3. Run `npm test -- --watchAll=false` for tests.
4. Run `npm run build` for the production bundle.

Example optional AI configuration:

```env
OPENAI_API_KEY=your-provider-key
OPENAI_PROJECT_ID=your-openai-project-id
AI_BASE_URL=https://an-openai-compatible-provider.example/v1
AI_MODEL=provider-model-name
```

Do not commit or distribute `.env`.

## Trade-offs and future work

Browser storage provides lightweight single-device persistence. A multi-user
production version would replace it with authenticated backend storage, followed
by task editing and cross-device synchronization. A production deployment should
also add rate-limiting and abuse monitoring to the AI endpoint.
