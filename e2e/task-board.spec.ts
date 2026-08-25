import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('creates a task and moves it through the workflow', async ({ page }) => {
  await addTask(page, 'Prepare release notes');

  const todo = page.getByRole('region', { name: 'Todo' });
  const inProgress = page.getByRole('region', { name: 'In Progress' });

  await expect(
    todo.getByRole('article', { name: 'Prepare release notes' })
  ).toBeVisible();
  await page
    .getByRole('button', {
      name: 'Move Prepare release notes to the next column',
    })
    .click();
  await expect(
    inProgress.getByRole('article', { name: 'Prepare release notes' })
  ).toBeVisible();
});

test('restores tasks after a page refresh', async ({ page }) => {
  await addTask(page, 'Persist browser task');

  await page.reload();

  await expect(
    page
      .getByRole('region', { name: 'Todo' })
      .getByRole('article', { name: 'Persist browser task' })
  ).toBeVisible();
});

test('drags a task directly to another column', async ({ page }) => {
  await addTask(page, 'Drag browser task');

  const card = page.getByRole('article', { name: 'Drag browser task' });
  const dragHandle = card.getByTestId(/drag-handle-/);
  const inReview = page.getByRole('region', { name: 'In Review' });

  const source = await dragHandle.boundingBox();
  const destination = await inReview.boundingBox();
  if (!source || !destination) {
    throw new Error('Expected the drag handle and destination to be visible.');
  }

  const sourceX = source.x + source.width / 2;
  const sourceY = source.y + source.height / 2;
  await dragHandle.dispatchEvent('mousedown', {
    button: 0,
    buttons: 1,
    clientX: sourceX,
    clientY: sourceY,
  });
  await page.mouse.move(source.x + source.width / 2 + 10, source.y, {
    steps: 5,
  });
  await expect(card).toHaveClass(/card--dragging/);
  await page.mouse.move(
    destination.x + destination.width / 2,
    destination.y + destination.height / 2,
    { steps: 15 }
  );
  await page.mouse.up();

  await expect(
    inReview.getByRole('article', { name: 'Drag browser task' })
  ).toBeVisible();
});

test('restores dark mode after a page refresh', async ({ page }) => {
  const darkMode = page.getByRole('button', { name: 'Dark mode' });

  await darkMode.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

async function addTask(
  page: import('@playwright/test').Page,
  description: string
) {
  await page.getByLabel('Task description').fill(description);
  await page.getByRole('button', { name: 'Add task' }).click();
}
