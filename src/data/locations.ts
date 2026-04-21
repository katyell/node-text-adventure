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
      WEST: 'street',
    },
    lockedExits: { SOUTH: 'gatesUnlocked' },
    lockedMessages: {
      SOUTH:
        "The iron gates are firmly locked. You'll need to find a way to open them before you can pass.",
    },
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
    name: 'Busy Street',
    description:
      'You are on a busy street. People are hurrying about, not making eye contact. The street continues both east and west, looping back to where you started.',
    shortDescription: 'You are back on the busy street. People hurry past.',
    exits: { WEST: 'start', EAST: 'start' },
    lockedExits: {},
    items: [],
    npcs: [],
  },
  'iron gates': {
    name: 'Iron Gates',
    description:
      'You are standing before a pair of large iron gates. They look old and rusty and are firmly locked. Beyond them stretches a wide expanse of grass. The street is back to the north.',
    shortDescription: 'The iron gates loom before you, still locked.',
    exits: { NORTH: 'start' },
    lockedExits: {},
    items: [],
    npcs: [],
  },
};
