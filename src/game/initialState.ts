import { locations } from '../data/locations.js';
import type { GameState } from '../types.js';

/**
 * Returns a fresh initial game state.
 * Called as a factory so RESET always gets a clean copy.
 */
export function createInitialState(): GameState {
  // Derive locationItems from the source-of-truth items arrays in locations
  const locationItems = Object.fromEntries(
    Object.entries(locations).map(([id, loc]) => [id, [...loc.items]])
  );

  return {
    screen: 'title', // 'title' | 'game'
    location: 'start',
    inventory: [],
    wearing: ['tshirt', 'jeans', 'wristwatch'],
    locationItems, // { locationId: [itemId, ...] }
    visited: {}, // { locationId: true } — set on first arrival
    flags: {}, // puzzle state flags (see prd.md §5.4)
    awaitingConfirm: null, // null | 'QUIT'
    output: [], // [{ type: 'output'|'input', text: string }]
  };
}
