import React, { useEffect, useRef, useState } from 'react';
import {
  Task,
  TaskState,
  WorkItemType,
  MoveDir,
  MAX_TASK_LENGTH,
} from '../types';
import Column from './Column';
import NewTaskForm from './NewTaskForm';
import '../styles.scss';

const columnOrder: TaskState[] = [
  TaskState.Todo,
  TaskState.InProgress,
  TaskState.InReview,
  TaskState.Done,
];

const STORAGE_KEY = 'qd-task-board:v1';
const POINT_OPTIONS = [1, 2, 3, 5, 8, 13];

export function TaskBoardComponent() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [announcement, setAnnouncement] = useState('');
  const [focusedTaskId, setFocusedTaskId] = useState<number | null>(null);
  const nextTaskId = useRef(
    Math.max(Date.now(), ...tasks.map((task) => task.id + 1))
  );

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (focusedTaskId === null) return;

    document.getElementById(`task-${focusedTaskId}`)?.focus();
    setFocusedTaskId(null);
  }, [focusedTaskId, tasks]);

  const addTask = (text: string, points: number, type: WorkItemType) => {
    const task: Task = {
      id: nextTaskId.current++,
      text,
      points,
      type,
      state: TaskState.Todo,
    };
    setTasks((currentTasks) => [...currentTasks, task]);
  };

  const moveTask = (id: number, dir: MoveDir) => {
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) return;

    const destination = nextState(currentTask.state, dir);
    moveTaskToState(currentTask, destination);
  };

  const moveTaskToState = (currentTask: Task, destination: TaskState) => {
    if (destination === currentTask.state) return;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === currentTask.id
          ? { ...task, state: destination }
          : task
      )
    );
    setAnnouncement(`${currentTask.text} moved to ${labels[destination]}.`);
    setFocusedTaskId(currentTask.id);
  };

  const dropTask = (id: number, destination: TaskState) => {
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) return;

    moveTaskToState(currentTask, destination);
  };

  const handleDelete = (id: number) => {
    const deletedTask = tasks.find((task) => task.id === id);
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
    if (deletedTask) {
      setAnnouncement(`${deletedTask.text} deleted.`);
    }
  };

  const tasksByState = (state: TaskState) =>
    tasks.filter((t) => t.state === state);

  return (
    <section className="board" id="task-board" aria-labelledby="board-title">
      <div className="board__intro">
        <div>
          <p className="board__eyebrow">Product delivery</p>
          <h1 className="board__title" id="board-title">Task Board</h1>
          <p className="board__description">
            Prioritize the work, estimate effort, and track delivery at a glance.
          </p>
        </div>
        <p className="board__summary" aria-live="polite">
          <strong>{tasks.length}</strong> {tasks.length === 1 ? 'task' : 'tasks'}
        </p>
      </div>

      <NewTaskForm onAdd={addTask} />

      <section className="board__columns">
        {columnOrder.map((state) => (
          <Column
            key={state}
            state={state}
            label={labels[state]}
            tasks={tasksByState(state)}
            onMove={moveTask}
            onDropTask={dropTask}
            onDelete={handleDelete}
          />
        ))}
      </section>

      <p className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}

const labels: Record<TaskState, string> = {
  [TaskState.Todo]: 'Todo',
  [TaskState.InProgress]: 'In Progress',
  [TaskState.InReview]: 'In Review',
  [TaskState.Done]: 'Done',
};

function nextState(state: TaskState, dir: MoveDir): TaskState {
  const i = columnOrder.indexOf(state) + dir;
  return columnOrder[i] ?? state;
}

function loadTasks(): Task[] {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (!storedValue) return [];

    const data: unknown = JSON.parse(storedValue);
    if (
      !isRecord(data) ||
      data.version !== 1 ||
      !Array.isArray(data.tasks) ||
      !data.tasks.every(isTask)
    ) {
      console.warn('Ignoring invalid saved task-board data.');
      return [];
    }
    return data.tasks;
  } catch (error) {
    console.warn(
      'Task persistence is unavailable:',
      error instanceof Error ? error.message : 'Unknown storage error'
    );
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, tasks })
    );
  } catch (error) {
    console.warn(
      'Could not save task-board data:',
      error instanceof Error ? error.message : 'Unknown storage error'
    );
  }
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;

  return (
    Number.isSafeInteger(value.id) &&
    typeof value.text === 'string' &&
    value.text.trim().length > 0 &&
    value.text.length <= MAX_TASK_LENGTH &&
    typeof value.points === 'number' &&
    POINT_OPTIONS.includes(value.points) &&
    Object.values(WorkItemType).includes(value.type as WorkItemType) &&
    Object.values(TaskState).includes(value.state as TaskState)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
