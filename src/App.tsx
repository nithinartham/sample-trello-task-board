import React from 'react';
import './App.css';
import { TaskBoardComponent } from './components/ChallengeComponent';

function App() {
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
          <p className="App-header__status">
            <span aria-hidden="true" />
            Project board
          </p>
        </div>
      </header>
      <main className="App-main">
        <TaskBoardComponent />
      </main>
    </div>
  );
}

export default App;
