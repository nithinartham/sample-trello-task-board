# Qualified Digital FED Developer Test – Detailed Instructions

## Overview

This is a **starter scaffold** for a Trello-style task board application. The project structure, build configuration, and types are complete. Your job is to **build out the UI components, styling, and backend integration**.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd qd-fed-trello-developer-test
npm install
```

### 2. Environment Setup
Create a `.env` file at the project root:
```env
OPENAI_API_KEY=sk-...
OPENAI_PROJECT_ID=your-project-id
```

Get your API key from [platform.openai.com](https://platform.openai.com)

### 3. Run Development Server
```bash
npm run dev
```

Opens http://localhost:3000 (React) + http://localhost:8888 (Netlify Functions).

The NODE_OPTIONS flag for Node 18+ compatibility is already configured in `package.json` scripts.

---

## 🤖 AI Engineering & Context Architecture

Before building components, understand how the AI integration works:

### How It Flows

1. **User adds task** → `NewTaskForm` component
2. **Form submission** → Calls `onAdd(text)` callback
3. **Optional: Fetch suggestions** → Calls `fetchFollowUps(text)` from `ai.ts`
4. **API request** → POST to `/.netlify/functions/suggest`
5. **Netlify Function** → Calls OpenAI's gpt-3.5-turbo
6. **Response** → Returns 3 suggestions as strings
7. **User click** → Adds suggestion as new task

### File Responsibilities

**Frontend (`src/ai.ts`)**
```typescript
export async function fetchFollowUps(task: string): Promise<string[]> {
  // 1. POST request to /.netlify/functions/suggest
  // 2. Send { task: "user text" }
  // 3. Parse response { suggestions: [...] }
  // 4. Return suggestions array
}
```

**Backend (`src/netlify/functions/suggest.ts`)**
```typescript
export const handler: Handler = async (event) => {
  // 1. Extract task from event.body
  // 2. Initialize OpenAI client (uses OPENAI_API_KEY + OPENAI_PROJECT_ID)
  // 3. Call chat.completions.create() with gpt-3.5-turbo
  // 4. Parse response and return 3 suggestions
}
```

### Key Design Decisions

- **Model:** gpt-3.5-turbo (balance of speed & cost)
- **Temperature:** 0.8 (creative but coherent)
- **Limit:** 3 suggestions (reasonable UX)
- **Optional:** AI is not required for core functionality
- **Error handling:** Gracefully fall back if API fails

### Why This Architecture?

- **Serverless:** No backend server to maintain
- **Secure:** API key never exposed to frontend
- **Scalable:** Netlify handles function scaling
- **Flexible:** Suggestions are optional—board works without OpenAI

---

## 📋 Core Requirements

### Core Functionality
1. **Task Board** — Display a 4-column board: **Todo** → **In Progress** → **In Review** → **Done**
2. **Add Tasks** — Form to add new tasks (start in Todo column)
3. **Move Tasks** — Click buttons to move tasks left/right between columns
4. **Delete Tasks** — Remove tasks from the board
5. **AI Suggestions** (Optional) — After adding a task, fetch AI-powered follow-up suggestions

### UI/UX
- **Responsive design** — Works on mobile, tablet, desktop
- **Component structure** — Use the provided component shells
- **SCSS styling** — Use design tokens for colors, spacing, and typography
- **Qualified Digital branding** — Use company colors and design system

### Documentation
1. **AGENTS.md** - Create a document before you begin work that will serve as a reference to your AI tooling for what you are building and how you would like it built
2, **DOCUMENTATION.md** - Create a document that tracks how AI tooling was utilized during your development workflow

---

## 🛠️ Component-by-Component Breakdown

### 1. **src/components/Column.tsx**
Renders a single column with a header and list of TaskCards.

**Props:**
- `label: string` — Column header (e.g., "Todo")
- `tasks: Task[]` — Tasks in this column
- `onMove: (id, dir) => void` — Move task left (-1) or right (1)
- `onDelete: (id) => void` — Delete task

**TODO:**
- Render column header with `label`
- Map over `tasks` array and render `TaskCard` for each
- Pass `onMove` and `onDelete` handlers to each TaskCard

**Example structure:**
```tsx
<section className="column">
  <h2 className="column__header">{label}</h2>
  {tasks.map(task => (
    <TaskCard
      key={task.id}
      task={task}
      onMove={onMove}
      onDelete={onDelete}
    />
  ))}
</section>
```

---

### 2. **src/components/TaskCard.tsx**
Renders a single task with move and delete buttons.

**Props:**
- `task: Task` — Task object with `{ id: number, text: string, state: TaskState }`
- `onMove: (id, dir) => void` — Move task
- `onDelete: (id) => void` — Delete task

**TODO:**
- Display task text in the middle
- Render left arrow button (← , disabled if `task.state === TaskState.Todo`)
- Render right arrow button (→ , disabled if `task.state === TaskState.Done`)
- Render delete button (✕ or trash icon)
- Wire up click handlers:
  - Left arrow: `onMove(task.id, -1)`
  - Right arrow: `onMove(task.id, 1)`
  - Delete: `onDelete(task.id)`

**Example structure:**
```tsx
<div className="card">
  <button onClick={() => onMove(task.id, -1)} disabled={leftDisabled}>
    ←
  </button>
  <span className="card__text">{task.text}</span>
  <button onClick={() => onMove(task.id, 1)} disabled={rightDisabled}>
    →
  </button>
  <button onClick={() => onDelete(task.id)}>✕</button>
</div>
```

---

### 3. **src/components/NewTaskForm.tsx**
Form to add new tasks and optionally show AI suggestions.

**Props:**
- `onAdd: (text) => void` — Add new task callback

**TODO:**
- Render input field with placeholder "Add a new task..."
- Render submit button (text: "+" or "Add")
- On form submit:
  - Validate input is not empty
  - Trim whitespace
  - Call `onAdd(trimmed)` to add task
  - Clear input field
  - Optional: Call `fetchFollowUps(trimmed)` to get AI suggestions
- Optional: Render suggestions as clickable buttons below form
- Optional: Show loading state while fetching suggestions

**Example structure:**
```tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const trimmed = value.trim();
  if (!trimmed) return;
  
  onAdd(trimmed);
  setValue('');
  
  // Optional: fetch suggestions
  try {
    const suggestions = await fetchFollowUps(trimmed);
    setSuggestions(suggestions);
  } catch (err) {
    setError('Could not load suggestions');
  }
};
```

---

### 4. **src/components/ChallengeComponent.tsx**
Main board component that manages task state.

**State to manage:**
- `tasks: Task[]` — Array of all tasks

**Handlers to implement:**

**`addTask(text: string)`**
- Create new task with `id: Date.now()`, `text`, `state: TaskState.Todo`
- Add to tasks array

**`moveTask(id: number, dir: MoveDir)`**
- Find task by id
- Calculate next state using `nextState(currentState, dir)`
- Update task state
- Prevent moving left from Todo or right from Done (handled by disabled buttons)

**`handleDelete(id: number)`**
- Remove task from array by id

**Helper function (already provided):**
```typescript
function nextState(state: TaskState, dir: MoveDir): TaskState {
  const i = columnOrder.indexOf(state) + dir;
  return columnOrder[i] ?? state;  // Returns current state if at edge
}
```

**Example state updates:**
```tsx
const addTask = (text: string) =>
  setTasks(prev => [
    ...prev,
    { id: Date.now(), text, state: TaskState.Todo }
  ]);

const moveTask = (id: number, dir: MoveDir) =>
  setTasks(prev =>
    prev.map(t =>
      t.id === id ? { ...t, state: nextState(t.state, dir) } : t
    )
  );

const handleDelete = (id: number) =>
  setTasks(prev => prev.filter(t => t.id !== id));
```

---

### 5. **src/ai.ts**
API client to call the Netlify Function.

**TODO:**
```typescript
export async function fetchFollowUps(task: string): Promise<string[]> {
  const res = await fetch('/.netlify/functions/suggest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error ?? 'Failed to fetch suggestions');
  }

  const data = await res.json();
  return data.suggestions;
}
```

**Key points:**
- POST request to `/.netlify/functions/suggest`
- Send task text in JSON body
- Handle errors gracefully
- Return array of suggestions (or throw error)

---

### 6. **src/netlify/functions/suggest.ts**
Serverless backend that calls OpenAI.

**TODO:**
```typescript
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { task } = JSON.parse(event.body || '{}');
  if (!task) {
    return { statusCode: 400, body: 'Missing task' };
  }

  try {
    const message = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.8,
      messages: [
        {
          role: 'system',
          content: 'Suggest three concise next tasks to complete after this one. Return only the suggestions, one per line, without numbering.',
        },
        {
          role: 'user',
          content: `Task: ${task}`,
        },
      ],
    });

    const text = message.choices[0]?.message?.content || '';
    const suggestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .slice(0, 3);

    return {
      statusCode: 200,
      body: JSON.stringify({ suggestions }),
    };
  } catch (err: any) {
    console.error('OpenAI error:', err);
    return {
      statusCode: err?.status ?? 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
```

**Key points:**
- Validate HTTP method (POST only)
- Extract `task` from request body
- Initialize OpenAI client (uses env vars automatically)
- Call `chat.completions.create()` with gpt-3.5-turbo
- Parse response and extract suggestions
- Return JSON with suggestions array

---

### 7. **src/styles.scss**
Global styles and design tokens.

**TODO:**
- Define color variables (primary, neutral, borders, text, etc.)
- Define spacing scale (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px)
- Style `.board` (main container with flex grid layout)
- Style `.column` (individual columns with headers)
- Style `.card` (task cards with inline flex for buttons)
- Style `.new-task` (form with input and submit button)
- Make responsive (mobile-first approach)

**Design token structure (already stubbed):**
```scss
$color-primary: #0052cc;      // Brand primary
$color-success: #28a745;
$color-danger: #dc3545;
$color-neutral: #f8f9fa;
$color-text: #212529;
$color-border: #dee2e6;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
```

**Example styling:**
```scss
.board {
  display: flex;
  gap: $spacing-lg;
  flex-wrap: wrap;
  padding: $spacing-lg;
}

.column {
  flex: 1;
  min-width: 250px;
  border: 1px solid $color-border;
  padding: $spacing-md;
  background: $color-neutral;
}

.card {
  display: flex;
  gap: $spacing-sm;
  padding: $spacing-md;
  background: white;
  border: 1px solid $color-border;
  margin-bottom: $spacing-md;
}

.card__btn {
  padding: $spacing-xs $spacing-sm;
  border: 1px solid $color-border;
  background: white;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

---

### 8. **src/App.tsx**
Main app component.

**TODO:**
- Import `TaskBoardComponent` from `./components/ChallengeComponent`
- Render a header with QD branding
- Render the board component
- Add any global layout styling

**Example:**
```tsx
import { TaskBoardComponent } from './components/ChallengeComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Qualified Digital - Task Board</h1>
      </header>
      <main>
        <TaskBoardComponent />
      </main>
    </div>
  );
}
```

---

## 🏗️ Component Hierarchy

```
App
└── TaskBoardComponent (from ChallengeComponent.tsx)
    ├── Column (label: "Todo")
    │   ├── TaskCard (id: 1, text: "Build UI")
    │   │   ├── ← arrow (disabled)
    │   │   ├── "Build UI" text
    │   │   ├── → arrow
    │   │   └── ✕ delete
    │   ├── TaskCard (id: 2, text: "Add styling")
    │   │   └── ...
    │   └── ...
    ├── Column (label: "In Progress")
    │   └── TaskCard items
    ├── Column (label: "In Review")
    │   └── TaskCard items
    ├── Column (label: "Done")
    │   └── TaskCard items
    └── NewTaskForm
        ├── Input field
        ├── Submit button
        └── AI suggestions (optional)
```

---

## 💡 Tips & Best Practices

1. **Use TypeScript** — All types are defined in `types.ts` (Task, TaskState, MoveDir)
2. **Keep components simple** — Each component does one thing
3. **State management** — Keep task state in `TaskBoardComponent`, pass handlers down
4. **Styling** — Use SCSS variables for consistency and maintainability
5. **Error handling** — Handle API failures gracefully in NewTaskForm
6. **Accessibility** — Add `aria-label` to buttons, use semantic HTML
7. **Testing** — Write tests in `.test.tsx` files using Jest + RTL

---

## 🛣️ Trade-offs & Future Roadmap

### Current Design Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **react-scripts 4.0.3** | CRA stability, battle-tested | Older webpack, needs legacy OpenSSL flag (handled in package.json) |
| **No state library** | Keep it simple for learning | Prop drilling (fine for this scope) |
| **Optional AI** | Reduces scope, tests core skills | Some features depend on OpenAI availability |
| **In-memory state** | No backend DB needed | Tasks lost on page refresh |

### Optional Enhancements

- **Persistence:** localStorage to save tasks between sessions
- **Drag & Drop:** Use react-beautiful-dnd for smoother UX
- **Task Editing:** Double-click card to edit text inline
- **Tags/Categories:** Organize tasks by type or priority
- **Dark Mode:** Toggle light/dark theme via context
- **Keyboard Shortcuts:** Enter to submit, Escape to cancel, arrow keys to move
- **Animations:** Smooth CSS transitions when moving tasks
- **Unit Tests:** Jest + RTL coverage for all components

### Potential Upgrade Path (Future)

When this project grows:
- Replace **Create React App** with **Vite** (faster dev server)
- Add **React Query** for better API state management
- Upgrade to **React 18+** with concurrent features
- Consider **Zustand** or **Redux** for complex global state
- Move to **TypeScript strict mode** for type safety
- Add **E2E tests** with Playwright or Cypress
- Implement **database** (Supabase, Firebase) for persistence
- Add **user authentication** (Auth0, Supabase)

---

## 🧪 Testing

**Run tests:**
```bash
npm test
```

**Example test structure:**
```typescript
import { render, screen } from '@testing-library/react';
import TaskCard from './TaskCard';
import { TaskState } from '../types';

describe('TaskCard', () => {
  it('renders task text', () => {
    const task = { id: 1, text: 'Test task', state: TaskState.Todo };
    render(<TaskCard task={task} onMove={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('disables left arrow in Todo state', () => {
    const task = { id: 1, text: 'Test', state: TaskState.Todo };
    const { container } = render(
      <TaskCard task={task} onMove={() => {}} onDelete={() => {}} />
    );
    expect(container.querySelector('[disabled]')).toBeInTheDocument();
  });
});
```

---

## 🚢 Deployment

### Deploy to Netlify

```bash
npm run build
netlify deploy
```

Netlify automatically:
- Builds the React app to `/build`
- Deploys Netlify Functions from `src/netlify/functions/`
- Loads environment variables for OpenAI auth
- Serves your app globally on a live URL

---

## 📚 Learning Objectives

By completing this test, you'll demonstrate:
- ✅ React component composition & hooks (useState, etc.)
- ✅ TypeScript type safety and interfaces
- ✅ Responsive CSS/SCSS design with design tokens
- ✅ Async API integration (fetch, error handling)
- ✅ Netlify Functions & serverless architecture
- ✅ Git workflow & version control
- ✅ Problem-solving & code organization

---

## 🎯 Checklist

Before submitting, ensure:

- [ ] All 4 columns display (Todo, In Progress, In Review, Done)
- [ ] Can add tasks to Todo column
- [ ] Can move tasks left/right between columns
- [ ] Cannot move task beyond first/last column
- [ ] Can delete tasks
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] SCSS uses design tokens for colors/spacing
- [ ] TypeScript compiles without errors
- [ ] Code is clean and well-commented
- [ ] (Optional) AI suggestions work and can be added as tasks

---

Good luck! 🚀
