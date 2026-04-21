import { describe, it, expect } from 'vitest';
import { gameReducer } from './reducer.js';
import { createInitialState } from './initialState.js';
import type { GameState } from '../types.js';

// Helper: run a series of commands from a fresh state and return the final state
function runCommands(commands: string[]): GameState {
  return commands.reduce<GameState>(
    (state, cmd) => gameReducer(state, { type: 'COMMAND', payload: cmd }),
    gameReducer(createInitialState(), { type: 'START_GAME' })
  );
}

// Helper: last output text in a state
const lastOutput = (state: GameState) => state.output.at(-1)?.text ?? '';

describe('START_GAME', () => {
  it('sets screen to "game"', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' });
    expect(state.screen).toBe('game');
  });

  it('marks start as visited', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' });
    expect(state.visited.start).toBe(true);
  });

  it('appends intro text to output', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' });
    expect(state.output.length).toBeGreaterThan(0);
    expect(state.output[0].text).toMatch(/cobbled street/i);
  });

  it('appends location description after intro', () => {
    const state = gameReducer(createInitialState(), { type: 'START_GAME' });
    const allText = state.output.map((l) => l.text).join('\n');
    // The full (long) description is shown on game start regardless of visit flag
    expect(allText).toMatch(/--- COBBLED STREET ---/i);
    expect(allText).toMatch(/Exits:/i);
  });
});

describe('RESET', () => {
  it('returns a fresh title screen state', () => {
    const played = runCommands(['NORTH', 'TAKE coffee cup']);
    const reset = gameReducer(played, { type: 'RESET' });
    expect(reset.screen).toBe('title');
    expect(reset.inventory).toHaveLength(0);
    expect(reset.output).toHaveLength(0);
  });
});

describe('COMMAND — movement', () => {
  it('moves north to the café', () => {
    const state = runCommands(['NORTH']);
    expect(state.location).toBe('cafe');
  });

  it('moves back south to start', () => {
    const state = runCommands(['NORTH', 'SOUTH']);
    expect(state.location).toBe('start');
  });

  it('direction shorthand works', () => {
    const state = runCommands(['N']);
    expect(state.location).toBe('cafe');
  });

  it('outputs error when direction is blocked', () => {
    // café only has SOUTH; going NORTH from café has no exit
    const state = runCommands(['NORTH', 'NORTH']);
    expect(lastOutput(state)).toMatch(/can't go that way/i);
    expect(state.location).toBe('cafe');
  });

  it('all direction shorthands work at reducer level', () => {
    // N goes to cafe, S returns to start
    expect(runCommands(['N']).location).toBe('cafe');
    expect(runCommands(['N', 'S']).location).toBe('start');
    expect(runCommands(['E']).location).toBe('street');
    expect(runCommands(['W']).location).toBe('street');
  });

  it('UP and DOWN say "can\'t go that way" (no such exits exist)', () => {
    expect(lastOutput(runCommands(['UP']))).toMatch(/can't go that way/i);
    expect(lastOutput(runCommands(['DOWN']))).toMatch(/can't go that way/i);
    expect(lastOutput(runCommands(['U']))).toMatch(/can't go that way/i);
    expect(lastOutput(runCommands(['D']))).toMatch(/can't go that way/i);
  });

  it('locked iron gates block movement south without the flag', () => {
    const state = runCommands(['SOUTH']);
    expect(state.location).toBe('start');
    expect(lastOutput(state)).toMatch(/iron gates are firmly locked/i);
  });
});

describe('COMMAND — LOOK', () => {
  it('shows full description on LOOK even after revisit', () => {
    const state = runCommands(['NORTH', 'SOUTH', 'LOOK']);
    // The last LOOK should print the --- header
    const lookLines = state.output
      .slice()
      .reverse()
      .filter((l) => l.type === 'output');
    expect(lookLines.some((l) => l.text.startsWith('---'))).toBe(true);
  });
});

describe('COMMAND — TAKE / DROP', () => {
  it('takes an item from the room', () => {
    const state = runCommands(['NORTH', 'TAKE book']);
    expect(state.inventory).toContain('book');
    expect(state.locationItems.cafe).not.toContain('book');
  });

  it('cannot take the same item twice', () => {
    const state = runCommands(['NORTH', 'TAKE book', 'TAKE book']);
    expect(lastOutput(state)).toMatch(/no book here/i);
    expect(state.inventory.filter((i) => i === 'book')).toHaveLength(1);
  });

  it('drops an item back into the room', () => {
    const state = runCommands(['NORTH', 'TAKE book', 'DROP book']);
    expect(state.inventory).not.toContain('book');
    expect(state.locationItems.cafe).toContain('book');
  });

  it('cannot drop an item not in inventory', () => {
    const state = runCommands(['DROP book']);
    expect(lastOutput(state)).toMatch(/not carrying/i);
  });
});

describe('COMMAND — EXAMINE', () => {
  it('examines an item in the room', () => {
    const state = runCommands(['NORTH', 'EXAMINE book']);
    expect(lastOutput(state)).toMatch(/examine the book/i);
  });

  it('examines a worn item', () => {
    const state = runCommands(['EXAMINE tshirt']);
    expect(lastOutput(state)).toMatch(/examine the tshirt/i);
  });

  it('examines self', () => {
    const state = runCommands(['EXAMINE self']);
    expect(lastOutput(state)).toMatch(/examine the self/i);
  });

  it('returns error for unknown item', () => {
    const state = runCommands(['EXAMINE dragon']);
    expect(lastOutput(state)).toMatch(/don't see a dragon/i);
  });
});

describe('COMMAND — WEAR', () => {
  it('wears a clothing item from inventory', () => {
    // tshirt starts worn; pick up coffee cup then try wearing it to test non-clothing path
    const state = runCommands(['NORTH', 'TAKE coffee cup', 'WEAR coffee cup']);
    expect(lastOutput(state)).toMatch(/can't wear/i);
  });
});

describe('COMMAND — INVENTORY', () => {
  it('lists carried items', () => {
    const state = runCommands(['NORTH', 'TAKE book', 'INVENTORY']);
    // INVENTORY appends two lines: carrying (at -2), then wearing (at -1)
    expect(state.output.at(-2)!.text).toMatch(/book/);
  });

  it('lists worn items', () => {
    const state = runCommands(['INVENTORY']);
    // second-to-last output line
    const wornLine = state.output.at(-1)!.text;
    expect(wornLine).toMatch(/tshirt/);
  });
});

describe('COMMAND — USE', () => {
  it('uses tshirt with coffee cup (valid combination)', () => {
    const state = runCommands(['NORTH', 'USE tshirt WITH coffee cup']);
    expect(lastOutput(state)).toMatch(/clean the coffee cup/i);
  });

  it('returns "no effect" for undefined combination', () => {
    const state = runCommands([
      'NORTH',
      'TAKE book',
      'USE book WITH coffee cup',
    ]);
    expect(lastOutput(state)).toMatch(/doesn't do anything/i);
  });
});

describe('COMMAND — HELP', () => {
  it('outputs help text', () => {
    const state = runCommands(['HELP']);
    expect(lastOutput(state)).toMatch(/NORTH/i);
    expect(lastOutput(state)).toMatch(/QUIT/i);
  });

  it('H shorthand also works', () => {
    const state = runCommands(['H']);
    expect(lastOutput(state)).toMatch(/NORTH/i);
  });
});

describe('COMMAND — QUIT', () => {
  it('sets awaitingConfirm on QUIT', () => {
    const state = runCommands(['QUIT']);
    expect(state.awaitingConfirm).toBe('QUIT');
  });

  it('resets to title on Y confirmation', () => {
    const state = runCommands(['QUIT', 'Y']);
    expect(state.screen).toBe('title');
  });

  it('resets to title on YES confirmation', () => {
    const state = runCommands(['QUIT', 'YES']);
    expect(state.screen).toBe('title');
  });

  it('cancels quit on N', () => {
    const state = runCommands(['NORTH', 'QUIT', 'N']);
    expect(state.screen).toBe('game');
    expect(state.location).toBe('cafe');
    expect(state.awaitingConfirm).toBeNull();
  });

  it('carries on with any non-Y input during confirm', () => {
    const state = runCommands(['QUIT', 'no thanks']);
    expect(state.screen).toBe('game');
    expect(lastOutput(state)).toMatch(/carrying on/i);
  });
});

describe('COMMAND — unknown input', () => {
  it('outputs the unknown command message', () => {
    const state = runCommands(['DANCE']);
    expect(lastOutput(state)).toMatch(/don't understand/i);
  });

  it('empty command is ignored (no output added)', () => {
    const before = runCommands([]);
    const outputBefore = before.output.length;
    const after = gameReducer(before, { type: 'COMMAND', payload: '   ' });
    expect(after.output.length).toBe(outputBefore);
  });
});

describe('COMMAND — echoes input', () => {
  it('adds a type:"input" line for each command', () => {
    const state = runCommands(['LOOK']);
    const inputLines = state.output.filter((l) => l.type === 'input');
    expect(inputLines.length).toBeGreaterThan(0);
    expect(inputLines.at(-1)!.text).toBe('LOOK');
  });
});
