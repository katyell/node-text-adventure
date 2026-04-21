import { describe, it, expect } from 'vitest';
import { handleMove, handleLook } from './movement.js';

// Minimal state that mirrors the real shape without importing all game data
const makeState = (overrides = {}) => ({
  screen: 'game' as const,
  location: 'start',
  visited: {},
  flags: {},
  output: [],
  locationItems: {
    start: [],
    cafe: [],
    street: [],
    'iron gates': [],
    'south path': [],
    meadow: [],
  },
  inventory: [],
  wearing: [],
  awaitingConfirm: null,
  ...overrides,
});

describe('handleMove', () => {
  it('moves to the target location when the exit exists', () => {
    const state = makeState();
    const next = handleMove(state, 'NORTH');
    expect(next.location).toBe('cafe');
  });

  it('marks the destination as visited', () => {
    const state = makeState();
    const next = handleMove(state, 'NORTH');
    expect(next.visited.cafe).toBe(true);
  });

  it('appends location lines to output', () => {
    const state = makeState();
    const next = handleMove(state, 'NORTH');
    expect(next.output.length).toBeGreaterThan(0);
  });

  it('returns an error message for a non-existent exit', () => {
    const state = makeState({ location: 'cafe' }); // cafe only has SOUTH
    const next = handleMove(state, 'NORTH');
    expect(next.location).toBe('cafe'); // did not move
    expect(next.output.at(-1)!.text).toMatch(/can't go that way/i);
  });

  it('blocks a locked exit when its flag is not set', () => {
    // iron gates → SOUTH (meadow) requires flag 'gatesUnlocked'
    const state = makeState({ location: 'iron gates', flags: {} });
    const next = handleMove(state, 'SOUTH');
    expect(next.location).toBe('iron gates'); // did not move
    expect(next.output.at(-1)!.text).toMatch(/iron gates are firmly locked/i);
  });

  it('passes through a locked exit when the required flag is set', () => {
    const state = makeState({
      location: 'iron gates',
      flags: { gatesUnlocked: true },
    });
    const next = handleMove(state, 'SOUTH');
    expect(next.location).toBe('meadow');
  });

  it('east then west returns to the original location', () => {
    const fromGates = makeState({ location: 'iron gates' });
    const east = handleMove(fromGates, 'EAST');
    const west = handleMove(east, 'WEST');
    expect(west.location).toBe('iron gates');
  });

  it('shows items present in a new location', () => {
    // cafe has ['coffee cup', 'book'] — locationItems must reflect this
    const state = makeState({
      locationItems: { start: [], cafe: ['coffee cup', 'book'], street: [], 'iron gates': [] },
    });
    const next = handleMove(state, 'NORTH');
    const allText = next.output.map((l) => l.text).join('\n');
    expect(allText).toMatch(/coffee cup/);
    expect(allText).toMatch(/book/);
  });

  it('does not mutate the original state', () => {
    const state = makeState();
    handleMove(state, 'NORTH');
    expect(state.location).toBe('start');
    expect(state.visited).toEqual({});
  });

  it('shows short description when destination already visited', () => {
    const state = makeState({ visited: { cafe: true } });
    const next = handleMove(state, 'NORTH');
    // First line should be the shortDescription, not a --- header
    expect(next.output[0].text).not.toMatch(/^---/);
  });
});

describe('handleLook', () => {
  it('appends location description to output', () => {
    const state = makeState({ visited: { start: true } }); // already visited
    const next = handleLook(state);
    expect(next.output.length).toBeGreaterThan(0);
  });

  it('always shows the full description (forceLong), even if already visited', () => {
    const state = makeState({ visited: { start: true } });
    const next = handleLook(state);
    // Should start with the --- header, not the shortDescription
    expect(next.output[0].text).toMatch(/^---/);
  });

  it('does not change the location', () => {
    const state = makeState();
    const next = handleLook(state);
    expect(next.location).toBe('start');
  });

  it('does not mutate the original state', () => {
    const state = makeState();
    handleLook(state);
    expect(state.output).toHaveLength(0);
  });
});
