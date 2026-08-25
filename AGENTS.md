# Task Board Development Guide

## Goal

Build a production-minded Trello-style task board using the provided React 17,
TypeScript, SCSS, and Netlify Functions scaffold.

## Required behavior

- Display Todo, In Progress, In Review, and Done columns.
- Add trimmed, non-empty tasks with Fibonacci effort points to Todo.
- Classify each work item as a Bug, Story, or Task.
- Move tasks one column left or right without crossing board boundaries.
- Drag tasks directly between workflow columns.
- Delete tasks.
- Display task points and per-column point totals.
- Keep the core board usable when AI suggestions are unavailable.
- Support mobile, tablet, desktop, keyboard, and assistive-technology users.

## Engineering expectations

- Reuse the provided types and component boundaries.
- Keep task state in `TaskBoardComponent`.
- Prefer semantic HTML, explicit labels, visible focus states, and status messages.
- Validate untrusted input in both the browser and Netlify function.
- Never expose provider credentials to the browser or commit `.env` files.
- Surface actionable errors without leaking internal service details.
- Add focused tests for core behavior and important edge cases.
- Avoid unnecessary dependencies and unrelated scaffold upgrades.

## AI integration

AI suggestions are an optional progressive enhancement. Access the configured
provider only through the Netlify function and return a stable suggestions
payload. When no provider is configured, return deterministic suggestions that
the UI explicitly labels as an offline demo rather than AI-generated content.

## Validation

Run the existing test and production build commands. Confirm responsive behavior,
keyboard operation, boundary controls, error states, and that the submission
contains no secrets or generated dependency directories.
