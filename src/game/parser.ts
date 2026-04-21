import type { ParsedCommand, ParsedVerb } from '../types.js';

const DIRECTIONS = new Set<ParsedVerb>([
  'NORTH',
  'SOUTH',
  'EAST',
  'WEST',
  'UP',
  'DOWN',
]);

const SHORTHANDS: Record<string, ParsedVerb> = {
  N: 'NORTH',
  S: 'SOUTH',
  E: 'EAST',
  W: 'WEST',
  U: 'UP',
  D: 'DOWN',
  I: 'INVENTORY',
  H: 'HELP',
  L: 'LOOK',
};

export function parseCommand(raw: string): ParsedCommand {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();

  // Single-letter shorthands
  if (upper in SHORTHANDS) return { verb: SHORTHANDS[upper] };

  // Full directions
  if (DIRECTIONS.has(upper as ParsedVerb)) return { verb: upper as ParsedVerb };

  // Single-word commands
  if (upper === 'LOOK') return { verb: 'LOOK' };
  if (upper === 'INVENTORY') return { verb: 'INVENTORY' };
  if (upper === 'HELP') return { verb: 'HELP' };
  if (upper === 'QUIT') return { verb: 'QUIT' };
  if (upper === 'ASSEMBLE') return { verb: 'ASSEMBLE' };

  // EXAMINE <item>  /  X <item>
  if (upper.startsWith('EXAMINE '))
    return { verb: 'EXAMINE', noun: trimmed.slice(8).trim().toLowerCase() };
  if (upper.startsWith('X '))
    return { verb: 'EXAMINE', noun: trimmed.slice(2).trim().toLowerCase() };

  // TAKE <item>
  if (upper.startsWith('TAKE '))
    return { verb: 'TAKE', noun: trimmed.slice(5).trim().toLowerCase() };

  // DROP <item>
  if (upper.startsWith('DROP '))
    return { verb: 'DROP', noun: trimmed.slice(5).trim().toLowerCase() };

  // WEAR <item>
  if (upper.startsWith('WEAR '))
    return { verb: 'WEAR', noun: trimmed.slice(5).trim().toLowerCase() };

  // TALK TO <npc>
  if (upper.startsWith('TALK TO '))
    return { verb: 'TALK_TO', noun: trimmed.slice(8).trim().toLowerCase() };

  // SAY <word>
  if (upper.startsWith('SAY '))
    return { verb: 'SAY', noun: trimmed.slice(4).trim().toLowerCase() };

  // USE <source> WITH <target>
  const useMatch = trimmed.match(/^USE\s+(.+?)\s+WITH\s+(.+)$/i);
  if (useMatch)
    return {
      verb: 'USE',
      source: useMatch[1].trim().toLowerCase(),
      target: useMatch[2].trim().toLowerCase(),
    };

  return { verb: 'UNKNOWN', raw: trimmed };
}
