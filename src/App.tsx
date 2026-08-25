import React, { useLayoutEffect, useState } from 'react';
import './App.css';
import { TaskBoardComponent } from './components/ChallengeComponent';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'qd-task-board:theme';

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.warn(
        'Could not save theme preference:',
        error instanceof Error ? error.message : 'Unknown storage error'
      );
    }
  }, [theme]);

  const nextTheme = theme === 'light' ? 'dark' : 'light';

  return (
    <div className="App">
      <header className="App-header">
        <div className="App-header__content">
          <a className="App-brand" href="#task-board" aria-label="Qualified Digital task board home">
            <span className="App-brand__mark" aria-hidden="true">QD</span>
            <span>
              Qualified Digital
              <small>Delivery workspace</small>
            </span>
          </a>
          <div className="App-header__actions">
            <p className="App-header__status">
              <span aria-hidden="true" />
              Project board
            </p>
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setTheme(nextTheme)}
              aria-label="Dark mode"
              aria-pressed={theme === 'dark'}
            >
              <span className="theme-toggle__icon" aria-hidden="true">
                {theme === 'light' ? 'Moon' : 'Sun'}
              </span>
              <span>{theme === 'dark' ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>
      </header>
      <main className="App-main">
        <TaskBoardComponent />
      </main>
    </div>
  );
}

function getInitialTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  } catch (error) {
    console.warn(
      'Theme preference is unavailable:',
      error instanceof Error ? error.message : 'Unknown storage error'
    );
  }

  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export default App;
