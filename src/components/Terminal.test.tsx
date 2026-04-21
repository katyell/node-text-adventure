// @vitest-environment jsdom

import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Terminal } from './Terminal.js';

afterEach(() => {
  cleanup();
});

describe('Terminal start flow', () => {
  it('shows the title screen on load', () => {
    render(<Terminal />);

    expect(
      screen.getByRole('heading', { name: /the clockwork cafe/i })
    ).toBeTruthy();
    expect(screen.getByText(/a regency time-slip mystery/i)).toBeTruthy();
    expect(screen.getByText(/press enter to begin/i)).toBeTruthy();
  });

  it('starts the game on Enter and focuses the command input', async () => {
    const user = userEvent.setup();
    render(<Terminal />);

    const startInput = screen.getByTestId('start-input');
    await user.click(startInput);
    await user.keyboard('{Enter}');

    expect(
      screen.getByText(
        /you appear to be lying face-down on a busy cobbled street/i
      )
    ).toBeTruthy();
    // After the intro the full (long) location description is shown
    expect(screen.getByText(/--- cobbled street ---/i)).toBeTruthy();
    expect(screen.getByText(/exits:/i)).toBeTruthy();

    const commandInput = screen.getByTestId('command-input');
    expect(commandInput).toBe(document.activeElement);
  });
});
