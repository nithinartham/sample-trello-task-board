import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import * as DndKit from '@dnd-kit/core';
import { TaskBoardComponent } from './ChallengeComponent';
import { TaskState } from '../types';

let mockDragEnd:
  | ((event: {
      active: { id: number | string };
      over: { id: TaskState | string } | null;
    }) => void)
  | undefined;

jest.mock('@dnd-kit/core', () => {
  return {
    DndContext: jest.fn(),
    MouseSensor: jest.fn(),
    TouchSensor: jest.fn(),
    useSensor: jest.fn(),
    useSensors: jest.fn(),
    useDraggable: jest.fn(),
    useDroppable: jest.fn(),
  };
});

describe('TaskBoardComponent drag and drop', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockDragEnd = undefined;
    (DndKit.DndContext as jest.Mock).mockImplementation(
      ({
        children,
        onDragEnd,
      }: {
        children: React.ReactNode;
        onDragEnd: typeof mockDragEnd;
      }) => {
        mockDragEnd = onDragEnd;
        return <>{children}</>;
      }
    );
    (DndKit.useSensor as jest.Mock).mockImplementation(() => ({}));
    (DndKit.useSensors as jest.Mock).mockImplementation(
      (...sensors) => sensors
    );
    (DndKit.useDraggable as jest.Mock).mockImplementation(() => ({
      listeners: {},
      setNodeRef: jest.fn(),
      transform: null,
      isDragging: false,
    }));
    (DndKit.useDroppable as jest.Mock).mockImplementation(() => ({
      isOver: false,
      setNodeRef: jest.fn(),
    }));
  });

  it('moves a task directly to the dropped column', () => {
    const taskId = addTask('Drop this task');

    act(() => {
      mockDragEnd?.({
        active: { id: taskId },
        over: { id: TaskState.InReview },
      });
    });

    expect(
      within(screen.getByRole('region', { name: 'In Review' })).getByText(
        'Drop this task'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('board-announcement')).toHaveTextContent(
      'Drop this task moved to In Review.'
    );
  });

  it('does nothing when a task is dropped onto its current column', () => {
    const taskId = addTask('Keep this task');

    act(() => {
      mockDragEnd?.({
        active: { id: taskId },
        over: { id: TaskState.Todo },
      });
    });

    expect(
      within(screen.getByRole('region', { name: 'Todo' })).getByText(
        'Keep this task'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('board-announcement')).toBeEmptyDOMElement();
  });

  it.each([
    ['has no destination', { active: { id: 1 }, over: null }],
    [
      'has a non-numeric task id',
      { active: { id: 'task-1' }, over: { id: TaskState.Done } },
    ],
    [
      'targets an invalid destination',
      { active: { id: 1 }, over: { id: 'Archived' } },
    ],
  ])('ignores a drag result that %s', (_case, event) => {
    addTask('Unchanged task');

    act(() => {
      mockDragEnd?.(event);
    });

    expect(
      within(screen.getByRole('region', { name: 'Todo' })).getByText(
        'Unchanged task'
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('board-announcement')).toBeEmptyDOMElement();
  });

  function addTask(text: string): number {
    render(<TaskBoardComponent />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: text },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    const card = screen.getByRole('article', { name: text });
    return Number(card.id.replace('task-', ''));
  }
});
