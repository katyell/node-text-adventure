import { items } from '../../data/items.js';
import { append, possessions } from '../stateHelpers.js';
import type { GameState } from '../../types.js';

/**
 * Examine an item in the room or in the player's possession.
 * @param {object} state
 * @param {string|undefined} noun
 */
export function handleExamine(
  state: GameState,
  noun: string | undefined
): GameState {
  if (!noun) return append(state, 'Examine what?');

  const own = possessions(state);
  const inRoom = (state.locationItems[state.location] ?? []).includes(noun);

  if (!own.has(noun) && !inRoom) {
    return append(state, `You don't see a ${noun} here.`);
  }

  const itemDef = items[noun];
  if (!itemDef) {
    return append(state, `You don't see anything special about the ${noun}.`);
  }

  return append(state, `You examine the ${noun}. ${itemDef.description}`);
}

/**
 * Pick up an item from the current location.
 * @param {object} state
 * @param {string|undefined} noun
 */
export function handleTake(
  state: GameState,
  noun: string | undefined
): GameState {
  if (!noun) return append(state, 'Take what?');

  const locItems = state.locationItems[state.location] ?? [];
  if (!locItems.includes(noun)) {
    return append(state, `There is no ${noun} here to take.`);
  }

  const newLocItems = {
    ...state.locationItems,
    [state.location]: locItems.filter((i) => i !== noun),
  };
  return append(
    {
      ...state,
      inventory: [...state.inventory, noun],
      locationItems: newLocItems,
    },
    `You pick up the ${noun}.`
  );
}

/**
 * Drop a carried item into the current location.
 * @param {object} state
 * @param {string|undefined} noun
 */
export function handleDrop(
  state: GameState,
  noun: string | undefined
): GameState {
  if (!noun) return append(state, 'Drop what?');

  if (!state.inventory.includes(noun)) {
    return append(state, `You're not carrying a ${noun}.`);
  }

  const locItems = state.locationItems[state.location] ?? [];
  const newLocItems = {
    ...state.locationItems,
    [state.location]: [...locItems, noun],
  };
  return append(
    {
      ...state,
      inventory: state.inventory.filter((i) => i !== noun),
      locationItems: newLocItems,
    },
    `You drop the ${noun}.`
  );
}

/**
 * Move a clothing item from inventory to the wearing list.
 * @param {object} state
 * @param {string|undefined} noun
 */
export function handleWear(
  state: GameState,
  noun: string | undefined
): GameState {
  if (!noun) return append(state, 'Wear what?');

  if (state.wearing.includes(noun)) {
    return append(state, `You are already wearing the ${noun}.`);
  }

  if (!state.inventory.includes(noun)) {
    return append(state, `You don't have a ${noun} to wear.`);
  }

  const itemDef = items[noun];
  if (!itemDef || itemDef.type !== 'clothing') {
    return append(state, `You can't wear the ${noun}.`);
  }

  return append(
    {
      ...state,
      inventory: state.inventory.filter((i) => i !== noun),
      wearing: [...state.wearing, noun],
    },
    `You put on the ${noun}.`
  );
}

/**
 * List the player's inventory and worn items.
 * @param {object} state
 */
export function handleInventory(state: GameState): GameState {
  const inv =
    state.inventory.length > 0 ? state.inventory.join(', ') : 'nothing';
  const worn =
    state.wearing.length > 0
      ? state.wearing.join(', ')
      : 'nothing — please put on some clothes!';
  return append(
    state,
    `You are carrying: ${inv}.`,
    `You are wearing: ${worn}.`
  );
}

/**
 * Use one item with another.
 * Item `uses` values are either a plain string or { text, setFlag }
 * for interactions that need to update game state flags.
 * @param {object} state
 * @param {string|undefined} source  item being used
 * @param {string|undefined} target  item being used on
 */
export function handleUse(
  state: GameState,
  source: string | undefined,
  target: string | undefined
): GameState {
  if (!source || !target)
    return append(state, 'Use this format: USE <item> WITH <item>');

  const own = possessions(state);
  const inRoom = (state.locationItems[state.location] ?? []).includes(target);

  if (!own.has(source)) {
    return append(state, `You don't have a ${source} to use.`);
  }

  if (!own.has(target) && !inRoom) {
    return append(state, `You can't find a ${target} to use it with.`);
  }

  const result = items[source]?.uses?.[target];
  if (!result) {
    return append(
      state,
      `Using the ${source} with the ${target} doesn't do anything.`
    );
  }

  // Plain-string result: repeatable message, no state change
  if (typeof result === 'string') {
    return append(state, result);
  }

  // Already-used case: if the setFlag is already true, show repeatText (or text) and make no further state change
  if (result.setFlag && state.flags[result.setFlag]) {
    return append(state, result.repeatText ?? result.text);
  }

  // First-time use: apply any state effects, then print the result text
  let nextState = state;

  if (result.setFlag) {
    nextState = {
      ...nextState,
      flags: { ...nextState.flags, [result.setFlag]: true },
    };
  }

  if (result.consumeSource) {
    nextState = {
      ...nextState,
      inventory: nextState.inventory.filter((i) => i !== source),
      wearing: nextState.wearing.filter((i) => i !== source),
    };
  }

  if (result.consumeTarget) {
    const locItems = nextState.locationItems[nextState.location] ?? [];
    nextState = {
      ...nextState,
      inventory: nextState.inventory.filter((i) => i !== target),
      wearing: nextState.wearing.filter((i) => i !== target),
      locationItems: {
        ...nextState.locationItems,
        [nextState.location]: locItems.filter((i) => i !== target),
      },
    };
  }

  return append(nextState, result.text);
}
