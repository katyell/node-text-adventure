/**
 * All location definitions.
 *
 * Each location has:
 *   name            — short display name
 *   description     — long description (shown on first visit or LOOK)
 *   shortDescription — brief description (shown on return visits)
 *   exits           — { DIRECTION: locationId } — bidirectional, always
 *   lockedExits     — { DIRECTION: flagName } — exit only passable when flags[flagName] is true
 *   items           — item ids present at game start (source of truth for initialState)
 *   npcs            — npc ids present in this location
 */
export const locations = {
  start: {
    name: 'Cobbled Street',
    description:
      "You are lying face-down on a busy cobbled street. People bustle past without a second glance — perhaps dishevelled strangers are common here. Your head is groggy. The street runs east to west. To the north is a café, and to the south you can see a pair of large iron gates.",
    shortDescription:
      'You are back on the cobbled street. The café is to the north; the iron gates lie to the south.',
    exits: {
      NORTH: 'cafe',
      EAST: 'street',
      SOUTH: 'iron gates',
      WEST: 'street',
    },
    lockedExits: {},
    items: [],
    npcs: [],
  },
  cafe: {
    name: 'Café',
    description:
      "You are in a cosy café. The smell of coffee fills the air and stacks of old-looking books are scattered across every surface. A few people are sitting at small tables, but they don't seem to notice you enter. The only exit is south.",
    shortDescription: "You are back in the café. It smells of coffee and old paper.",
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
}
