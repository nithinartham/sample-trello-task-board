import React, { DragEvent, useState } from 'react';
import { Task, TaskState, MoveDir } from '../types';
import TaskCard from './TaskCard';

interface Props {
  state: TaskState;
  label: string;
  tasks: Task[];
  onMove: (id: number, dir: MoveDir) => void;
  onDropTask: (id: number, state: TaskState) => void;
  onDelete: (id: number) => void;
}

const TASK_DRAG_TYPE = 'application/x-task-id';

export default function Column({
  state,
  label,
  tasks,
  onMove,
  onDropTask,
  onDelete,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const headingId = `column-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const modifier = label.toLowerCase().replace(/\s+/g, '-');
  const totalPoints = tasks.reduce((total, task) => total + task.points, 0);

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes(TASK_DRAG_TYPE)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const taskId = Number(event.dataTransfer.getData(TASK_DRAG_TYPE));
    if (Number.isSafeInteger(taskId)) {
      onDropTask(taskId, state);
    }
  };

  return (
    <section
      className={`column column--${modifier}${isDragOver ? ' column--drag-over' : ''}`}
      aria-labelledby={headingId}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column__heading">
        <h2 className="column__header" id={headingId}>{label}</h2>
        <div className="column__metrics">
          <span className="column__points" aria-label={`${totalPoints} total points`}>
            {totalPoints} pts
          </span>
          <span className="column__count" aria-label={`${tasks.length} tasks`}>
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="column__tasks">
        {tasks.length === 0 ? (
          <p className="column__empty">No tasks yet</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </section>
  );
}
