import { describe, it, expect } from 'vitest';
import { locations } from './locations.js';

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
});
