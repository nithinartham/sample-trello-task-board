# 📋 Trello-Style Task Board – Qualified Digital FED Test

**Candidate:** Nithin Artham

A four-column Trello-style task board (Todo → In Progress → In Review → Done) with optional AI-powered follow-up suggestions, built with **React 17 + TypeScript + SCSS** and served as **static assets + Netlify Functions**.

This repository contains the completed implementation for the Qualified Digital
FED development test.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd qd-fed-trello-developer-test
npm install
```

### 2. Optional Provider Configuration

Provider-backed suggestions use a `.env` file at the project root:

```env
OPENAI_API_KEY=sk-...
OPENAI_PROJECT_ID=openai-project-id
# Optional for another OpenAI-compatible public provider:
AI_BASE_URL=https://provider.example/v1
AI_MODEL=provider-model-name
```

OpenAI API credentials are managed at
[platform.openai.com](https://platform.openai.com).

### 3. Run Development Server
```bash
npm run dev
```

Open **http://localhost:8888** for the Netlify development proxy, which serves
the React application and local serverless function together.

The NODE.js 18+ OpenSSL compatibility is already configured in `package.json`, so just run `npm run dev` directly.

| Command          | Purpose                                       |
|------------------|-----------------------------------------------|
| `npm run dev`    | React + Netlify Functions (development)       |
| `npm start`      | React only (no serverless functions)          |
| `npm run build`  | Production bundle (`/build` folder)           |
| `npm test`       | Jest + React Testing Library tests            |

---

## 🧩 Tech Stack

- **Frontend:** React 17 + TypeScript 4 + SCSS with design tokens
- **Serverless:** Netlify Functions (TypeScript) for backend
- **AI:** OpenAI Node SDK v4 with configurable OpenAI-compatible providers
- **Build:** Create React App with Webpack 4
- **Styling:** SCSS with BEM naming and responsive design

---

## 🤖 AI Engineering & Context Architecture

### How AI Suggestions Work

When a user adds a task, the app can fetch AI-powered follow-up suggestions via the Netlify Function:

**Flow:**
1. User submits task text in `NewTaskForm`
2. `fetchFollowUps()` makes POST request to `/.netlify/functions/suggest`
3. Netlify Function calls the configured provider or returns labeled offline
   demo suggestions when no key is configured
4. Suggestions are returned and displayed as clickable buttons
5. User can click a suggestion to add it as a new task

### Backend Implementation

**`src/netlify/functions/suggest.ts`** handles:
- Receiving task text from frontend
- Creating OpenAI client (authenticated via `OPENAI_API_KEY` + `OPENAI_PROJECT_ID`)
- Calling `gpt-3.5-turbo` with a system prompt: _"Suggest three next tasks to complete after this one"_
- Parsing response and returning 3 suggestions

### Frontend Integration

**`src/ai.ts`** is the API client that:
- Makes POST request to `/.netlify/functions/suggest`
- Handles errors and network failures gracefully
- Returns array of 3 suggestions

### Design Decisions

- **Model:** gpt-3.5-turbo (fast, cost-effective)
- **Temperature:** 0.8 (creative but not too random)
- **Limit:** 3 suggestions max (doesn't overwhelm UI)
- **Optional:** AI suggestions are optional—the board works without them

---

## 📁 Project Structure

```
src/
├── components/                 # React components (mostly empty shells)
│   ├── ChallengeComponent.tsx   # Main board (state management)
│   ├── Column.tsx               # Single column renderer
│   ├── TaskCard.tsx             # Individual task card
│   └── NewTaskForm.tsx          # Add task form + AI suggestions
├── netlify/functions/
│   └── suggest.ts               # OpenAI integration (Netlify Function)
├── ai.ts                        # API client for Netlify Functions
├── types.ts                     # TypeScript interfaces (Task, TaskState, etc.)
├── styles.scss                  # Global styles & design tokens
├── App.tsx                      # Main app component
└── index.tsx                    # React entry point
```

---

## ✅ Implemented Features

- Four-column task workflow with add, move, and delete behavior
- Native drag-and-drop with accessible movement-button alternatives
- Bug, Story, and Task classifications
- Fibonacci effort points with per-column totals
- Versioned local persistence across browser refreshes
- Responsive mobile, tablet, and desktop layouts
- Optional provider-backed suggestions with a clearly labeled offline demo mode
- Defensive API validation and graceful error handling
- React Testing Library coverage for board, API-client, and function behavior

---

## 🔑 Environment Variables

Optional for provider-backed AI suggestions:

```env
OPENAI_API_KEY=sk-...                    # Provider API key
OPENAI_PROJECT_ID=openai-project-id      # Optional OpenAI project ID
```

`OPENAI_API_KEY` is required when AI suggestions are enabled.
`OPENAI_PROJECT_ID` is optional for providers that do not use OpenAI project
scoping. `AI_BASE_URL` and `AI_MODEL` allow an OpenAI-compatible public provider
to be selected without changing browser code.

Without credentials, the application remains fully functional and provides
deterministic suggestions marked **Offline demo**.

---

## 🚢 Deployment

### Deploy to Netlify

```bash
npm run build
netlify deploy
```

Netlify automatically:
- Builds the React app (`/build` folder)
- Deploys Netlify Functions from `src/netlify/functions/`
- Loads environment variables for OpenAI authentication

---

## 🛣️ Trade-offs & Future Roadmap

### Current Design Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **react-scripts 4.0.3** | CRA stability, minimal config | Older webpack, needs legacy OpenSSL flag (handled in package.json) |
| **No state library** | Keep it simple for learning | Prop drilling in larger apps (not an issue here) |
| **Optional AI** | Reduces scope, tests core skills | Some feedback depends on OpenAI availability |
| **In-memory state** | No backend DB needed | Tasks lost on refresh (could add localStorage) |

### Optional Enhancements (Future)

- **Persistence:** localStorage to save tasks between sessions
- **Drag & Drop:** Use react-beautiful-dnd or similar
- **Task Editing:** Double-click to edit task text
- **Tags/Categories:** Organize tasks by type
- **Dark Mode:** Toggle light/dark theme
- **Keyboard Shortcuts:** Enter to submit, Escape to cancel
- **Animations:** Smooth transitions between columns
- **Unit Tests:** Jest + RTL coverage for components

### Potential Upgrade Path

When outgrowing this scaffold:
- Replace Create React App with Vite (faster dev server)
- Add React Query for better API management
- Upgrade to React 18+ with concurrent features
- Consider Zustand or Redux for complex state
- Move to TypeScript strict mode
- Add E2E tests with Playwright/Cypress

---

## 📚 Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Netlify Functions](https://docs.netlify.com/functions/overview)
- [OpenAI API](https://platform.openai.com/docs)
- [SCSS Guide](https://sass-lang.com/guide)

---

## Engineering Highlights

- React component composition and predictable state updates
- Strict TypeScript domain models
- Responsive SCSS with reusable design tokens
- Keyboard and screen-reader support
- Async API integration with defensive response validation
- Netlify Functions serverless architecture
- Focused automated tests and documented AI-assisted development
