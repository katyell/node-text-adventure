// ---------------------------------------------------------------------------
// Shared types for the text adventure game
// ---------------------------------------------------------------------------

// ── Output ──────────────────────────────────────────────────────────────────

/** A single line of terminal output, rendered by Terminal.tsx */
export type OutputLine = {
  type: 'output' | 'input';
  text: string;
};

// ── Game state ───────────────────────────────────────────────────────────────

export type GameScreen = 'title' | 'game';

export type GameState = {
  /** Which screen is active */
  screen: GameScreen;
  /** Current location id */
  location: string;
  /** Item ids the player is carrying */
  inventory: string[];
  /** Item ids the player is wearing */
  wearing: string[];
  /** Items present in each location, derived from locations data at init */
  locationItems: Record<string, string[]>;
  /** Locations the player has already visited */
  visited: Record<string, boolean>;
  /** Puzzle state flags, e.g. { gearFitted: true } */
  flags: Record<string, boolean>;
  /** Set to 'QUIT' while waiting for Y/N confirmation */
  awaitingConfirm: 'QUIT' | null;
  /** Accumulated terminal output */
  output: OutputLine[];
};

// ── Reducer actions ──────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'COMMAND'; payload: string }
  | { type: 'RESET' };

// ── Items ────────────────────────────────────────────────────────────────────

export type ItemType =
  | 'clothing'
  | 'consumable'
  | 'readable'
  | 'human'
  | 'key'
  | 'component'
  | 'misc';

/**
 * The value of an item's `uses` entry.
 * Plain string → message only (repeatable, no state change).
 * Object → message + optional state effects:
 *   - setFlag: set a game flag to true on success
 *   - repeatText: message shown when setFlag is already true (i.e. already used)
 *   - consumeSource / consumeTarget: remove the item on successful use
 */
export type UseResult =
  | string
  | {
      text: string;
      setFlag?: string;
      repeatText?: string;
      consumeSource?: boolean;
      consumeTarget?: boolean;
    };

export type ItemDefinition = {
  description: string;
  type: ItemType;
  uses: Record<string, UseResult>;
};

// ── Locations ────────────────────────────────────────────────────────────────

export type LocationDefinition = {
  name: string;
  description: string;
  shortDescription: string;
  /** Direction → destination location id */
  exits: Record<string, string>;
  /** Direction → flag name required to pass */
  lockedExits: Record<string, string>;
  /** Direction → custom message shown when the exit is locked (falls back to generic) */
  lockedMessages?: Record<string, string>;
  /** Item ids present at game start */
  items: string[];
  /** NPC ids present in this location */
  npcs: string[];
};

// ── Parser ───────────────────────────────────────────────────────────────────

export type ParsedVerb =
  | 'NORTH'
  | 'SOUTH'
  | 'EAST'
  | 'WEST'
  | 'UP'
  | 'DOWN'
  | 'LOOK'
  | 'INVENTORY'
  | 'HELP'
  | 'QUIT'
  | 'ASSEMBLE'
  | 'EXAMINE'
  | 'TAKE'
  | 'DROP'
  | 'WEAR'
  | 'USE'
  | 'TALK_TO'
  | 'SAY'
  | 'UNKNOWN';

export type ParsedCommand = {
  verb: ParsedVerb;
  noun?: string;
  source?: string;
  target?: string;
  raw?: string;
};
