# 📋 Trello-Style Task Board – Qualified Digital FED Test

**Candidate:** Nithin Artham

A four-column Trello-style task board (Todo → In Progress → In Review → Done) with AI-powered follow-up suggestions, built with **React 17 + TypeScript + SCSS** and served as **static assets + Netlify Functions**.

This is a **starter scaffold** for the Qualified Digital FED development test. The project structure and configuration are complete, but the UI components, styling, and backend integration are intentionally left for you to implement.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd qd-fed-trello-developer-test
npm install
```

### 2. Environment Setup
Create a `.env` file at the project root with your OpenAI credentials:

```env
OPENAI_API_KEY=sk-...
OPENAI_PROJECT_ID=your-project-id
# Optional for another OpenAI-compatible public provider:
AI_BASE_URL=https://provider.example/v1
AI_MODEL=provider-model-name
```

Get your API key from [platform.openai.com](https://platform.openai.com)

### 3. Run Development Server
```bash
npm run dev
```

Opens **http://localhost:3000** with:
- React dev server (port 3000)
- Netlify Functions emulator (port 8888)

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
- **AI:** OpenAI Node SDK v4 (gpt-3.5-turbo for suggestions)
- **Build:** Create React App with Webpack 4
- **Styling:** SCSS with BEM naming and responsive design

---

## 🤖 AI Engineering & Context Architecture

### How AI Suggestions Work

When a user adds a task, the app can fetch AI-powered follow-up suggestions via the Netlify Function:

**Flow:**
1. User submits task text in `NewTaskForm`
2. `fetchFollowUps()` makes POST request to `/.netlify/functions/suggest`
3. Netlify Function calls OpenAI's `chat.completions.create()`
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

## 🎯 Your Task

Build out the following to make the board functional:

1. **UI Components** — Implement `Column`, `TaskCard`, and `NewTaskForm` components
2. **Task Management** — Wire state logic in `ChallengeComponent` (add, move, delete tasks)
3. **Styling** — Create responsive SCSS layout with design tokens
4. **API Integration** — Implement `ai.ts` client and `suggest.ts` function (optional)

See **`INSTRUCTIONS.md`** for a detailed breakdown of what to build in each component.

---

## 🔑 Environment Variables

Required for AI suggestions to work:

```env
OPENAI_API_KEY=sk-...              # Your OpenAI API key
OPENAI_PROJECT_ID=your-project-id  # Your OpenAI project ID
```

`OPENAI_API_KEY` is required when AI suggestions are enabled.
`OPENAI_PROJECT_ID` is optional for providers that do not use OpenAI project
scoping. `AI_BASE_URL` and `AI_MODEL` allow an OpenAI-compatible public provider
to be selected without changing browser code.

---

## 📝 Tips for Developers

- **Start with `INSTRUCTIONS.md`** — It has step-by-step requirements for each component
- **Use TypeScript** — All types are defined in `types.ts` (Task, TaskState, MoveDir)
- **Component Hierarchy** — Keep task state in `ChallengeComponent`, pass handlers down
- **Styling** — Use SCSS variables for consistency (colors, spacing already stubbed)
- **Error Handling** — Handle API failures gracefully in `NewTaskForm`
- **Testing** — Jest + React Testing Library are configured

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

## 🎓 Learning Objectives

By completing this test, you'll demonstrate:
- ✅ React component composition & state management
- ✅ TypeScript type safety
- ✅ Responsive CSS/SCSS design
- ✅ Async API integration
- ✅ Netlify Functions / serverless architecture
- ✅ Git & version control
- ✅ Problem-solving & code organization

Good luck! 🚀
