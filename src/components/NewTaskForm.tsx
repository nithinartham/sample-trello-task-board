import React, { useState, FormEvent } from 'react';
import { fetchFollowUps } from '../ai';
import { MAX_TASK_LENGTH, WorkItemType } from '../types';

interface Props {
  onAdd: (text: string, points: number, type: WorkItemType) => void;
}

const POINT_OPTIONS = [1, 2, 3, 5, 8, 13];

export default function NewTaskForm({ onAdd }: Props) {
  const [value, setValue] = useState('');
  const [points, setPoints] = useState(3);
  const [type, setType] = useState(WorkItemType.Task);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAi, setUseAi] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionSource, setSuggestionSource] = useState<'ai' | 'demo' | null>(
    null
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    onAdd(trimmed, points, type);
    setValue('');
    setPoints(3);
    setType(WorkItemType.Task);
    setError(null);
    setSuggestions([]);
    setSuggestionSource(null);

    if (!useAi) return;

    setLoading(true);
    try {
      const result = await fetchFollowUps(trimmed);
      setSuggestions(result.suggestions);
      setSuggestionSource(result.source);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'The task was added, but suggestions are unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addSuggestion = (suggestion: string) => {
    onAdd(suggestion, 1, WorkItemType.Task);
    setSuggestions((current) =>
      current.filter((item) => item !== suggestion)
    );
  };

  return (
    <section className="new-task-panel" aria-labelledby="new-task-title">
      <div className="new-task-panel__heading">
        <div>
          <p className="new-task-panel__eyebrow">Quick add</p>
          <h2 id="new-task-title">Create a new task</h2>
          <p>Estimate the effort and add it to Todo.</p>
        </div>
        <span>{value.length}/{MAX_TASK_LENGTH}</span>
      </div>
      <form className="new-task" onSubmit={handleSubmit} aria-busy={loading}>
        <div className="new-task__field">
          <label htmlFor="new-task-input">Task description</label>
          <input
            id="new-task-input"
            className="new-task__input"
            placeholder="What needs to be done?"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={MAX_TASK_LENGTH}
            autoComplete="off"
          />
        </div>
        <div className="new-task__field new-task__field--points">
          <label htmlFor="new-task-points">Points</label>
          <select
            id="new-task-points"
            className="new-task__points"
            value={points}
            onChange={(event) => setPoints(Number(event.target.value))}
          >
            {POINT_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="new-task__field new-task__field--type">
          <label htmlFor="new-task-type">Type</label>
          <select
            id="new-task-type"
            className="new-task__type"
            value={type}
            onChange={(event) => setType(event.target.value as WorkItemType)}
          >
            <option value={WorkItemType.Task}>Task</option>
            <option value={WorkItemType.Story}>Story</option>
            <option value={WorkItemType.Bug}>Bug</option>
          </select>
        </div>
        <button
          className="new-task__submit"
          type="submit"
          disabled={!value.trim() || loading}
        >
          <span aria-hidden="true">+</span> Add task
        </button>
      </form>

      <label className="new-task__ai-option">
        <input
          type="checkbox"
          checked={useAi}
          onChange={(event) => setUseAi(event.target.checked)}
          disabled={loading}
        />
        Generate follow-up suggestions
      </label>
      <p className="new-task__hint">
        Add as many work items as you need. Suggestions are limited to three per request.
      </p>

      <div className="new-task__status" aria-live="polite">
        {loading && <p>Generating follow-up suggestions...</p>}
        {error && <p className="new-task__error">{error}</p>}
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions" aria-labelledby="suggestions-title">
          <div className="suggestions__heading">
            <h3 id="suggestions-title">Suggested next tasks</h3>
            <span>
              {suggestionSource === 'demo' ? 'Offline demo' : 'AI generated'}
            </span>
          </div>
          <div className="suggestions__list">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSuggestion(suggestion)}
              >
                <span aria-hidden="true">+</span> {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
