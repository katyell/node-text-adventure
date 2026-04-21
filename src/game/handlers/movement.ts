import { locations } from '../../data/locations.js';
import { append, locationLines } from '../stateHelpers.js';
import type { GameState } from '../../types.js';

/**
 * Move the player in a given direction.
 * Checks whether the exit exists and whether it is locked behind a flag.
 * @param {object} state
 * @param {'NORTH'|'SOUTH'|'EAST'|'WEST'|'UP'|'DOWN'} direction
 */
export function handleMove(state: GameState, direction: string): GameState {
  const loc = locations[state.location];
  const target = loc.exits[direction];

  if (!target) {
    return append(state, "You can't go that way.");
  }

  const lockFlag = loc.lockedExits?.[direction];
  if (lockFlag && !state.flags[lockFlag]) {
    const targetLoc = locations[target];
    const lockedMessage =
      loc.lockedMessages?.[direction] ??
      `The way to ${targetLoc.name} is blocked. You need to find another way through.`;
    return append(state, lockedMessage);
  }

  const newVisited = { ...state.visited, [target]: true };
  // Use the pre-move visited state so locationLines correctly shows the long
  // description on first arrival (target not yet in state.visited).
  const lines = locationLines(state, target);
  return append({ ...state, location: target, visited: newVisited }, ...lines);
}

/**
 * Print the full description of the current location regardless of visit history.
 * @param {object} state
 */
export function handleLook(state: GameState): GameState {
  const lines = locationLines(state, state.location, true);
  return append(state, ...lines);
}
