import { describe, it, expect } from 'vitest';
import { locations } from './locations.js';

const OPPOSITE: Record<string, string> = {
  NORTH: 'SOUTH',
  SOUTH: 'NORTH',
  EAST: 'WEST',
  WEST: 'EAST',
  UP: 'DOWN',
  DOWN: 'UP',
};

describe('locations data integrity', () => {
  it('every exit target is a valid location id', () => {
    for (const [id, loc] of Object.entries(locations)) {
      for (const [dir, target] of Object.entries(loc.exits)) {
        expect(
          locations[target],
          `Location "${id}" exit ${dir} points to unknown location "${target}"`
        ).toBeDefined();
      }
    }
  });

  it('every connection is bidirectional (each exit has a return path)', () => {
    for (const [id, loc] of Object.entries(locations)) {
      for (const [dir, target] of Object.entries(loc.exits)) {
        const targetExits = Object.values(locations[target].exits);
        expect(
          targetExits,
          `Location "${target}" (reached via ${dir} from "${id}") has no exit back to "${id}"`
        ).toContain(id);
      }
    }
  });

  it('every lockedExit direction also exists in exits', () => {
    for (const [id, loc] of Object.entries(locations)) {
      for (const dir of Object.keys(loc.lockedExits)) {
        expect(
          loc.exits[dir],
          `Location "${id}" has lockedExit "${dir}" but no matching exit`
        ).toBeDefined();
      }
    }
  });

  it('a two-step move in the same direction never bounces back immediately', () => {
    for (const [id, loc] of Object.entries(locations)) {
      for (const [dir, target] of Object.entries(loc.exits)) {
        const secondStep = locations[target].exits[dir];
        if (secondStep) {
          expect(
            secondStep,
            `Location "${id}" goes ${dir} to "${target}", but another ${dir} returns to the origin`
          ).not.toBe(id);
        }
      }
    }
  });

  it('when both opposite cardinal exits exist, they point back to each other', () => {
    for (const [id, loc] of Object.entries(locations)) {
      for (const [dir, target] of Object.entries(loc.exits)) {
        const opposite = OPPOSITE[dir];
        if (!opposite) continue;
        const back = locations[target].exits[opposite];
        if (back) {
          expect(
            back,
            `Location "${id}" -> ${dir} -> "${target}" has ${opposite}, but it does not return to "${id}"`
          ).toBe(id);
        }
      }
    }
  });
});
