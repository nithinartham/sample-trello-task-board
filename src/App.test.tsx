import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

describe('App', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      });
    } else {
      delete (window as Window & { matchMedia?: typeof window.matchMedia })
        .matchMedia;
    }
  });

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
      screen.getByTestId('board-announcement')
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

  it('provides a touch-capable drag handle for each task', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: 'Drag this task' },
    });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '8' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    const card = screen.getByRole('article', { name: 'Drag this task' });
    const dragHandle = screen.getByTestId(
      card.getAttribute('id')!.replace('task-', 'drag-handle-')
    );

    expect(card).not.toHaveAttribute('draggable');
    expect(dragHandle).toHaveAttribute('aria-hidden', 'true');
    expect(within(card).getByLabelText('8 points')).toBeInTheDocument();
  });

  it('restores saved tasks after the app remounts', () => {
    const firstRender = render(<App />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: 'Persist this task' },
    });
    fireEvent.change(screen.getByLabelText('Points'), { target: { value: '13' } });
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'bug' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    firstRender.unmount();

    render(<App />);
    const todoColumn = screen.getByRole('region', { name: 'Todo' });

    expect(within(todoColumn).getByText('Persist this task')).toBeInTheDocument();
    expect(within(todoColumn).getByText('Bug')).toBeInTheDocument();
    expect(within(todoColumn).getByLabelText('13 points')).toBeInTheDocument();
  });

  it.each([
    ['malformed JSON', '{not-json'],
    ['an unsupported version', JSON.stringify({ version: 2, tasks: [] })],
    [
      'an invalid task',
      JSON.stringify({
        version: 1,
        tasks: [
          {
            id: 1,
            text: 'Invalid estimate',
            points: 7,
            type: 'task',
            state: 'todo',
          },
        ],
      }),
    ],
  ])('ignores saved task data containing %s', (_case, storedValue) => {
    window.localStorage.setItem('qd-task-board:v1', storedValue);
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);

    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    expect(screen.getByText('0', { selector: '.board__summary strong' })).toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
  });

  it('keeps the board usable when task storage cannot be read', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Task Board' })).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      'Task persistence is unavailable:',
      'Storage blocked'
    );
  });

  it('keeps task creation usable when task storage cannot be written', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);
    fireEvent.change(screen.getByLabelText('Task description'), {
      target: { value: 'Unsaved task' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));

    expect(screen.getByText('Unsaved task')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(
      'Could not save task-board data:',
      'Storage blocked'
    );
  });

  it('toggles and restores the saved color theme', () => {
    const firstRender = render(<App />);
    const darkModeButton = screen.getByRole('button', {
      name: 'Dark mode',
    });

    expect(darkModeButton).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(darkModeButton);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('qd-task-board:theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    firstRender.unmount();

    render(<App />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('uses the system dark preference when no valid theme is stored', () => {
    window.localStorage.setItem('qd-task-board:theme', 'sepia');
    mockColorScheme(true);

    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('uses the system preference when theme storage cannot be read', () => {
    mockColorScheme(true);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(warn).toHaveBeenCalledWith(
      'Theme preference is unavailable:',
      'Storage blocked'
    );
  });

  it('still changes theme when the preference cannot be saved', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage blocked');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(warn).toHaveBeenCalledWith(
      'Could not save theme preference:',
      'Storage blocked'
    );
  });

  function mockColorScheme(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue({
        matches,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }),
    });
  }
});
