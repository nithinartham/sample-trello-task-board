import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, TaskState, MoveDir } from '../types';
import TaskCard from './TaskCard';

interface Props {
  state: TaskState;
  label: string;
  tasks: Task[];
  onMove: (id: number, dir: MoveDir) => void;
  onDelete: (id: number) => void;
}

export default function Column({
  state,
  label,
  tasks,
  onMove,
  onDelete,
}: Props) {
  const { isOver, setNodeRef } = useDroppable({ id: state });
  const headingId = `column-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const modifier = label.toLowerCase().replace(/\s+/g, '-');
  const totalPoints = tasks.reduce((total, task) => total + task.points, 0);

  return (
    <section
      ref={setNodeRef}
      className={`column column--${modifier}${isOver ? ' column--drag-over' : ''}`}
      aria-labelledby={headingId}
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
