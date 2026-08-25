# QD FED Trello Developer Test – Setup & Distribution Guide

## What's Included

`qd-fed-trello-developer-test.zip` is a **complete starter scaffold** with all configuration, but zero implementation:
- ❌ No UI components (empty shells with TODOs)
- ❌ No styling (SCSS structure ready)
- ❌ No API integration (stubs ready to implement)
- ✅ Full project structure, types, build setup, and documentation

---

## 🚀 Quick Start (For Developers)

### 1. Clone & Install
```bash
git clone <repo-url>
cd qd-fed-trello-developer-test
npm install
```

### 2. Environment Setup
Create `.env` file in project root:
```env
OPENAI_API_KEY=sk-...
OPENAI_PROJECT_ID=your-project-id
```

Get keys from [platform.openai.com](https://platform.openai.com)

### 3. Run Development Server
```bash
npm run dev
```

Opens:
- **React dev server:** http://localhost:3000
- **Netlify Functions:** http://localhost:8888

The OpenSSL compatibility flag is built into `package.json` scripts—no manual setup needed.

---

## 🧩 Tech Stack

- **Frontend:** React 17 + TypeScript 4 + SCSS with design tokens
- **Serverless:** Netlify Functions (TypeScript backend)
- **AI:** OpenAI SDK v4 (gpt-3.5-turbo)
- **Build:** Create React App with Webpack 4
- **Node version:** ≥18 (compatible with package.json scripts)

---

## 🤖 AI Engineering & Context Architecture

### How the AI Integration Works

When a user adds a task:

1. **Frontend** (`src/ai.ts`) → POST to `/.netlify/functions/suggest`
2. **Netlify Function** (`src/netlify/functions/suggest.ts`) → Calls OpenAI
3. **OpenAI Response** → Returns 3 contextual suggestions
4. **User** → Clicks suggestion to add as new task

### Why This Design?

- **Serverless:** No backend server to maintain
- **Secure:** API key never exposed to frontend
- **Optional:** Board works fine without AI
- **Scalable:** Netlify handles all function scaling

### Key Implementation Details

- **Model:** gpt-3.5-turbo (fast, cost-effective)
- **Temperature:** 0.8 (creative but coherent)
- **Limit:** 3 suggestions max
- **Error handling:** Graceful fallback if API unavailable

---

## 📁 What Developers Need to Build

| Component | File | Effort | What to Build |
|-----------|------|--------|---------------|
| **Column** | `src/components/Column.tsx` | 15 min | Render column header + TaskCard list |
| **TaskCard** | `src/components/TaskCard.tsx` | 20 min | Render task with move/delete buttons |
| **NewTaskForm** | `src/components/NewTaskForm.tsx` | 20 min | Form to add tasks + optional AI |
| **ChallengeComponent** | `src/components/ChallengeComponent.tsx` | 20 min | Manage task state (add/move/delete) |
| **AI Client** | `src/ai.ts` | 10 min | Fetch suggestions from Netlify Function |
| **OpenAI Function** | `src/netlify/functions/suggest.ts` | 15 min | Call OpenAI API, return suggestions |
| **Styling** | `src/styles.scss` | 30 min | Responsive design with design tokens |

**Total estimated effort:** 2-3 hours for experienced React developers

---

## ✅ Core Features

Developers should implement:

- ✅ 4-column task board (Todo → In Progress → In Review → Done)
- ✅ Add new tasks via form
- ✅ Move tasks left/right between columns
- ✅ Delete tasks
- ✅ Responsive design (mobile, tablet, desktop)
- ⭐ (Optional) AI suggestions powered by OpenAI

---

## 📚 Documentation

Inside the zip, developers will find:

- **`README.md`** — Project overview, quick start, tech stack
- **`INSTRUCTIONS.md`** — Detailed component-by-component breakdown (read this first!)
- **`INSTRUCTIONS.md`** → AI Engineering section explains the architecture
- **`INSTRUCTIONS.md`** → Trade-offs & Roadmap sections for context

---

## 🛣️ Trade-offs & Future Roadmap

### Why These Choices?

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| react-scripts 4.0.3 | Stability, minimal setup | Older webpack (OpenSSL flag handled) |
| No state library | Keep it simple for learning | Prop drilling (fine for this scope) |
| Optional AI | Reduces scope, tests core skills | Depends on OpenAI availability |
| In-memory state | No DB needed | Tasks lost on refresh |

### Optional Enhancements

Developers can add after core features:
- localStorage for task persistence
- Drag & drop between columns
- Task editing (double-click)
- Tags/categories
- Dark mode toggle
- Keyboard shortcuts
- Unit test coverage

### Growth Path

When outgrowing this scaffold:
- Migrate to **Vite** (faster than CRA)
- Add **React Query** for API management
- Upgrade to **React 18+**
- Use **Zustand** or **Redux** for state
- Add **database** (Supabase, Firebase)
- Add **authentication** (Auth0)
- Add **E2E tests** (Playwright, Cypress)

---

## 🚢 Deployment

### Deploy to Netlify

```bash
npm run build
netlify deploy
```

Netlify automatically:
- Builds React app → `/build` folder
- Deploys Netlify Functions → `src/netlify/functions/`
- Loads environment variables
- Serves app on global CDN

---

## 📋 File Structure

```
qd-fed-trello-developer-test/
├── README.md                      # Main overview
├── INSTRUCTIONS.md                # Detailed build guide (read first!)
├── package.json                   # Dependencies + npm scripts
├── netlify.toml                   # Netlify config
├── .gitignore                     # Git ignore rules
├── src/
│   ├── App.tsx                    # Main component (stub)
│   ├── components/
│   │   ├── ChallengeComponent.tsx  # Board state mgmt (stub)
│   │   ├── Column.tsx              # Column renderer (empty)
│   │   ├── TaskCard.tsx            # Task card (empty)
│   │   └── NewTaskForm.tsx         # Form + AI (empty)
│   ├── netlify/functions/
│   │   └── suggest.ts             # OpenAI function (stub)
│   ├── ai.ts                      # API client (stub)
│   ├── types.ts                   # TypeScript types (complete)
│   ├── styles.scss                # Global styles (stub)
│   └── index.tsx                  # Entry point
├── public/
│   ├── index.html
│   └── favicon.ico
└── .env                           # Environment variables (create this)
```

---

## 🎓 Learning Outcomes

Developers completing this test will have demonstrated:

- ✅ React component composition & hooks
- ✅ TypeScript type safety
- ✅ Responsive CSS/SCSS design
- ✅ Async API integration with error handling
- ✅ Serverless functions (Netlify)
- ✅ Git & version control
- ✅ Problem-solving & code organization

---

## ❓ Support & Troubleshooting

### Common Issues

**"npm run dev" fails with OpenSSL error**
- Already fixed in `package.json`—just run `npm run dev`

**Port 3000/8888 already in use**
- Netlify CLI will auto-shift to available ports

**Environment variables not loading**
- Make sure `.env` is in project root (not `.env.local`)
- Restart dev server after changing `.env`

**AI suggestions not working**
- Check `OPENAI_API_KEY` and `OPENAI_PROJECT_ID` are correct
- Verify API key has credits/quota
- Check browser Network tab for 500 errors

### Getting Help

1. Check `INSTRUCTIONS.md` for detailed component requirements
2. Look at stub implementations and TODO comments
3. Test in browser console (F12) for error messages
4. Review OpenAI API docs for model details

---

## 📊 Project Stats

- **Package size:** ~675 KB (excludes node_modules)
- **Dependencies:** React 17, TypeScript 4, SCSS, Netlify, OpenAI SDK
- **Total files:** ~35 (configs, sources, tests, public assets)
- **Build time:** ~30 seconds
- **Dev server startup:** ~5 seconds

---

## 🎯 Distribution Checklist

Before handing off to developers:

- [ ] Extract zip file
- [ ] Run `npm install`
- [ ] Create `.env` with OpenAI credentials
- [ ] Run `npm run dev` and verify http://localhost:3000 loads
- [ ] Read `INSTRUCTIONS.md` for what to build
- [ ] Start implementing components!

Good luck! 🚀
