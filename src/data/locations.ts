import type { LocationDefinition } from '../types.js';

export const locations: Record<string, LocationDefinition> = {
  start: {
    name: 'Cobbled Street',
    description:
      'A busy cobbled street runs east to west. People bustle past without a second glance — perhaps dishevelled strangers are common here. To the north is a café, and to the south you can see a pair of large iron gates.',
    shortDescription:
      'You are back on the cobbled street. The café is to the north; the iron gates lie to the south.',
    exits: {
      NORTH: 'cafe',
      EAST: 'street',
      SOUTH: 'iron gates',
      WEST: 'west street',
    },
    lockedExits: {},
    items: [],
    npcs: [],
  },
  cafe: {
    name: 'Café',
    description:
      "You are in a cosy café. The smell of coffee fills the air and stacks of old-looking books are scattered across every surface. A few people are sitting at small tables, but they don't seem to notice you enter. The only exit is south.",
    shortDescription:
      'You are back in the café. It smells of coffee and old paper.',
    exits: { SOUTH: 'start' },
    lockedExits: {},
    items: ['coffee cup', 'book'],
    npcs: [],
  },
  street: {
    name: 'East Street',
    description:
      'You are on the eastern stretch of the street. Shopfront windows throw soft reflections across the cobbles. The main crossing is back to the west.',
    shortDescription:
      'You are back on East Street. The crossing is west from here.',
    exits: { WEST: 'start' },
    lockedExits: {},
    items: [],
    npcs: [],
  },
  'west street': {
    name: 'West Street',
    description:
      'You are on the western stretch of the street. A row of shuttered buildings leans over the pavement. The crossing is back to the east.',
    shortDescription:
      'You are back on West Street. The crossing is east from here.',
    exits: { EAST: 'start' },
    lockedExits: {},
    items: [],
    npcs: [],
  },
  'iron gates': {
    name: 'Iron Gates',
    description:
      'You are standing before a pair of large iron gates. Beyond them stretches a wide expanse of grass, but the way south is blocked by a heavy lock. The street is back to the north, and a narrow path runs east.',
    shortDescription:
      'You are back at the iron gates. North leads to the street; east follows a narrow path.',
    exits: { NORTH: 'start', EAST: 'south path', SOUTH: 'meadow' },
    lockedExits: { SOUTH: 'gatesUnlocked' },
    lockedMessages: {
      SOUTH:
        "The iron gates are firmly locked. You'll need to find a way to open them before you can pass.",
    },
    items: [],
    npcs: [],
  },
  'south path': {
    name: 'South Path',
    description:
      'A narrow gravel path hugs the outside wall near the gates. It feels quieter here, away from the crowds.',
    shortDescription:
      'You are on the narrow path beside the iron gates.',
    exits: { WEST: 'iron gates' },
    lockedExits: {},
    items: [],
    npcs: [],
  },
  meadow: {
    name: 'Meadow',
    description:
      'You step into a broad meadow of wind-brushed grass. The city noise fades behind you.',
    shortDescription: 'You are back in the meadow beyond the gates.',
    exits: { NORTH: 'iron gates' },
    lockedExits: {},
    items: [],
    npcs: [],
  },
};
