import { createInitialState } from './initialState.js';
import { parseCommand } from './parser.js';
import { append, locationLines } from './stateHelpers.js';
import { INTRO, HELP_TEXT } from './text.js';
import { handleMove, handleLook } from './handlers/movement.js';
import {
  handleExamine,
  handleTake,
  handleDrop,
  handleWear,
  handleInventory,
  handleUse,
} from './handlers/items.js';
import { handleTalkTo, handleSay } from './handlers/interaction.js';
import type { GameState, GameAction } from '../types.js';

// ---------------------------------------------------------------------------
// Main reducer
// ---------------------------------------------------------------------------

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const visited = { start: true };
      // forceLong=true so the full location description always prints on game
      // start, regardless of the visited flag being set simultaneously.
      const locLines = locationLines(state, 'start', true);
      const started = {
        ...state,
        screen: 'game' as const,
        visited,
        output: [] as GameState['output'],
      };
      return append(started, INTRO, ...locLines);
    }

    case 'COMMAND': {
      const raw = action.payload.trim();
      if (!raw) return state;

      // Echo the typed command
      let s = {
        ...state,
        output: [...state.output, { type: 'input' as const, text: raw }],
      };

      // Handle pending QUIT confirmation
      if (s.awaitingConfirm === 'QUIT') {
        const upper = raw.toUpperCase();
        if (upper === 'Y' || upper === 'YES') {
          return createInitialState();
        }
        return append({ ...s, awaitingConfirm: null }, 'Okay, carrying on.');
      }

      const cmd = parseCommand(raw);

      switch (cmd.verb) {
        case 'NORTH':
        case 'SOUTH':
        case 'EAST':
        case 'WEST':
        case 'UP':
        case 'DOWN':
          return handleMove(s, cmd.verb);

        case 'LOOK':
          return handleLook(s);

        case 'EXAMINE':
          return handleExamine(s, cmd.noun);

        case 'TAKE':
          return handleTake(s, cmd.noun);

        case 'DROP':
          return handleDrop(s, cmd.noun);

        case 'WEAR':
          return handleWear(s, cmd.noun);

        case 'INVENTORY':
          return handleInventory(s);

        case 'USE':
          return handleUse(s, cmd.source, cmd.target);

        case 'TALK_TO':
          return handleTalkTo(s, cmd.noun);

        case 'SAY':
          return handleSay(s, cmd.noun);

        case 'HELP':
          return append(s, HELP_TEXT);

        case 'QUIT':
          return append(
            { ...s, awaitingConfirm: 'QUIT' },
            'Are you sure you want to quit? All progress will be lost. (Y/N)'
          );

        case 'ASSEMBLE':
          return append(s, "You haven't collected all the components yet.");

        case 'UNKNOWN':
        default:
          return append(
            s,
            "I don't understand that. Type HELP for a list of commands."
          );
      }
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
