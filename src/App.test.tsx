import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders all workflow columns', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Progress' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'In Review' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done' })).toBeInTheDocument();
  });

  it('adds a trimmed task to Todo and prevents empty submissions', () => {
    render(<App />);
    const input = screen.getByLabelText('Task description');
    const addButton = screen.getByRole('button', { name: 'Add task' });

    expect(addButton).toBeDisabled();
    fireEvent.change(input, { target: { value: '  Build accessible board  ' } });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'story' } });
    fireEvent.click(addButton);

    const todoColumn = screen.getByRole('region', { name: 'Todo' });
    expect(within(todoColumn).getByText('Build accessible board')).toBeInTheDocument();
    expect(within(todoColumn).getByText('Story')).toBeInTheDocument();
    expect(within(todoColumn).getByLabelText('5 points')).toBeInTheDocument();
    expect(within(todoColumn).getByLabelText('5 total points')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getByLabelText('Points')).toHaveValue('3');
    expect(screen.getByLabelText('Type')).toHaveValue('task');
  });

  it('moves tasks one column at a time and respects board boundaries', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: 'Review implementation' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(
      screen.getByRole('button', {
        name: 'Move Review implementation to the previous column',
      })
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Move Review implementation to the next column',
      })
    );
    expect(
      within(screen.getByRole('region', { name: 'In Progress' })).getByText(
        'Review implementation'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('article', { name: 'Review implementation' })
    ).toHaveFocus();
    expect(
      screen.getByRole('status')
    ).toHaveTextContent('Review implementation moved to In Progress.');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Move Review implementation to the next column',
      })
    );
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Move Review implementation to the next column',
      })
    );

    expect(
      within(screen.getByRole('region', { name: 'Done' })).getByText(
        'Review implementation'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Move Review implementation to the next column',
      })
    ).toBeDisabled();
  });

  it('deletes a task', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: 'Temporary task' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete Temporary task' }));

    expect(screen.queryByText('Temporary task')).not.toBeInTheDocument();
    expect(screen.getByText('0', { selector: '.board__summary strong' })).toBeInTheDocument();
  });

  it('moves a task by dragging it to another column', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: 'Drag this task' },
    });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    const values = new Map<string, string>();
    const dataTransfer = {
      types: ['application/x-task-id'],
      effectAllowed: 'none',
      dropEffect: 'none',
      setData: (type: string, value: string) => values.set(type, value),
      getData: (type: string) => values.get(type) || '',
    };
    const card = screen.getByRole('article', { name: 'Drag this task' });
    const doneColumn = screen.getByRole('region', { name: 'Done' });

    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(doneColumn, { dataTransfer });
    fireEvent.drop(doneColumn, { dataTransfer });

    expect(within(doneColumn).getByText('Drag this task')).toBeInTheDocument();
    expect(within(doneColumn).getByLabelText('8 total points')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Drag this task moved to Done.'
    );
  });
});
