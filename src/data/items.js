/**
 * All item definitions.
 * Each item has: description, type, uses (map of targetItemId → result string).
 * types: 'clothing' | 'consumable' | 'readable' | 'human' | 'key' | 'component' | 'misc'
 */
export const items = {
  tshirt: {
    description: "It's a faded green t-shirt that's starting to fray at the edges.",
    type: 'clothing',
    uses: {
      'coffee cup':
        'You use the t-shirt to clean the coffee cup. It is now clean and ready to drink from.',
    },
  },
  jeans: {
    description:
      "They're a pretty bog standard pair of jeans. Your hand finds something in the pocket — a single modern coin.",
    type: 'clothing',
    uses: {},
  },
  wristwatch: {
    description:
      'A digital wristwatch displaying the exact date and time in crisp LCD numerals. Entirely out of place in 1815.',
    type: 'misc',
    uses: {},
  },
  'coffee cup': {
    description:
      "It's a half-empty cup of coffee. It smells like it has been sitting out for a while.",
    type: 'consumable',
    uses: {},
  },
  book: {
    description:
      "As you examine the book you realise it's not actually old at all — it's a coffee table book about Vogue magazine. A dramatic yellow hat and some fabulous fringe designs make you feel suddenly warm inside.",
    type: 'readable',
    uses: {},
  },
  self: {
    description: 'You look pretty incredible, if you do say so yourself.',
    type: 'human',
    uses: {},
  },
}
