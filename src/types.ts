export enum TaskState {
  Todo = 'todo',
  InProgress = 'inProgress',
  InReview = 'inReview',
  Done = 'done',
}

export enum WorkItemType {
  Task = 'task',
  Story = 'story',
  Bug = 'bug',
}

export interface Task {
  id: number;
  text: string;
  points: number;
  type: WorkItemType;
  state: TaskState;
}

export type MoveDir = -1 | 1;

export const MAX_TASK_LENGTH = 160;