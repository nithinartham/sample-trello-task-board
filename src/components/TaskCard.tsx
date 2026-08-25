import React, { DragEvent, useState } from 'react';
import { Task, TaskState, WorkItemType, MoveDir } from '../types';

interface Props {
  task: Task;
  onMove: (id: number, dir: MoveDir) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onMove, onDelete }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const leftDisabled = task.state === TaskState.Todo;
  const rightDisabled = task.state === TaskState.Done;

  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData('application/x-task-id', String(task.id));
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  return (
    <article
      className={`card${isDragging ? ' card--dragging' : ''}`}
      id={`task-${task.id}`}
      tabIndex={-1}
      aria-label={task.text}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
    >
      <div className="card__content">
        <div className="card__details">
          <span className={`card__type card__type--${task.type}`}>
            {typeLabels[task.type]}
          </span>
          <p className="card__text">{task.text}</p>
        </div>
        <span
          className="card__points"
          aria-label={`${task.points} ${task.points === 1 ? 'point' : 'points'}`}
        >
          {task.points}
        </span>
      </div>
      <div className="card__actions" aria-label={`Actions for ${task.text}`}>
        <button
          className="card__btn"
          type="button"
          onClick={() => onMove(task.id, -1)}
          disabled={leftDisabled}
          aria-label={`Move ${task.text} to the previous column`}
        >
          <span aria-hidden="true">&larr;</span>
        </button>
        <button
          className="card__btn"
          type="button"
          onClick={() => onMove(task.id, 1)}
          disabled={rightDisabled}
          aria-label={`Move ${task.text} to the next column`}
        >
          <span aria-hidden="true">&rarr;</span>
        </button>
        <button
          className="card__btn card__btn--delete"
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.text}`}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </article>
  );
}

const typeLabels: Record<WorkItemType, string> = {
  [WorkItemType.Task]: 'Task',
  [WorkItemType.Story]: 'Story',
  [WorkItemType.Bug]: 'Bug',
};
