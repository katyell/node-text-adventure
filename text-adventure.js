const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// find self in regency england - must rebuild time machine but also remember why you came
const introduction =
  "\nYou appear to be lying in a busy street - people are walking all around you, but nobody's paying you any attention. Your head feels groggy and you have no idea what you're doing here.\n\nYou look down and see that you are wearing a green t-shirt and a pair of jeans. \n\nGlancing around you, you see that the street you're on runs East and West. To the North is a cafe, and to the South you can see a pair of large iron gates.\n\n\n\nFor help, type 'help' or 'h'. To look around, type 'look' or 'l'. To check your inventory, type 'inventory' or 'i'. To exit the game, type 'exit'.\n";

const items = {
  tshirt: {
    description:
      "It's a faded green t-shirt that's starting to fray at the edges",
    type: 'clothing',
    uses: {
      'coffee cup':
        'You use the t-shirt to clean the coffee cup, it is now clean and ready to drink from.',
    },
  },
  jeans: {
    description: "They're a pretty bog standard pair of jeans",
    type: 'clothing',
    uses: {},
  },
  'coffee cup': {
    description:
      "It's a half empty cup of coffee, it smells like it has been sitting out for a while",
    type: 'consumable',
    uses: {},
  },
  book: {
    description:
      "As you examine the book, you realise that it's not actually old at all - it's a coffee table book about Vogue magazine. You see a dramatic yellow hat and some fabulous fringe designs, that make you feel suddenly warm inside",
    type: 'readable',
    uses: {},
  },
  self: {
    description: 'You look pretty incredible if you do say so yourself',
    type: 'human',
    uses: {},
  },
};

const wearing = ['tshirt', 'jeans'];
const inventory = [];
const possessions = ['self', ...wearing, ...inventory];

const locations = {
  start: {
    description:
      '\nYou are in a busy street which runs East and West. To the North is a cafe, and to the South you can see a pair of large iron gates.',
    directions: {
      NORTH: 'cafe',
      EAST: 'street',
      SOUTH: 'iron gates',
      WEST: 'street',
    },
    items: [],
  },
  cafe: {
    description:
      '\nYou are in a cozy cafe. The smell of coffee fills the air, and there are stacks of old looking books scattered around. A few people are sitting around, but they dont seem to notice you enter',
    directions: { SOUTH: 'start' },
    items: ['coffee cup', 'book'],
  },
  street: {
    description:
      '\nYou are on a busy street. Cars are speeding past and people are hurrying about, not making eye contact.',
    directions: { WEST: 'start', EAST: 'start' },
    items: [],
  },
  'iron gates': {
    description:
      '\nYou are standing in front of large iron gates. They look old and rusty, and they appear to be locked. Beyond the gates you can see nothing but a wide expanse of grass.',
    directions: { NORTH: 'start' },
    items: [],
  },
};

const askForInput = (location) => {
  const directions = locations[location].directions;
  rl.question(
    `\nYou can go ${Object.keys(directions).join(', ')}.\n\n >`,
    (answer) => {
      let command = answer.trim().toUpperCase();

      // Map shorthand to full directions
      const shorthandMap = {
        N: 'NORTH',
        S: 'SOUTH',
        E: 'EAST',
        W: 'WEST',
        I: 'INVENTORY',
        H: 'HELP',
        L: 'LOOK',
      };
      if (shorthandMap[command]) {
        command = shorthandMap[command];
      }

      if (command === 'EXIT') {
        console.log('Thanks for playing! Goodbye!');
        rl.close();
        return;
      }

      if (command === 'INVENTORY') {
        console.log(`You are carrying: ${inventory.join(', ') || 'nothing'}.`);
        console.log(
          `You are wearing: ${wearing.join(', ') || 'nothing. Please put on some clothes!'}.`
        );
        askForInput(location);
        return;
      }

      if (command === 'LOOK') {
        console.log(locations[location].description);
        if (locations[location].items.length > 0) {
          console.log(`You see: ${locations[location].items.join(', ')}.`);
        }
        askForInput(location);
        return;
      }

      // Handle the 'HELP' command
      if (command === 'HELP') {
        console.log(
          'The commands you can use are: north, south, east, west, help, inventory, look, examine, use x with y, and exit.'
        );
        askForInput(location);
        return;
      }

      // Handle a direction command
      if (directions[command]) {
        const chosenDirection = directions[command];
        console.log(locations[chosenDirection].description);
        if (locations[chosenDirection].items.length > 0) {
          console.log(
            `You see: ${locations[chosenDirection].items.join(', ')}.`
          );
        }
        askForInput(chosenDirection);
        return;
      }

      if (command.startsWith('TAKE ')) {
        const item = command.slice(5).toLowerCase();
        if (locations[location].items.includes(item)) {
          inventory.push(item);
          const index = locations[location].items.indexOf(item);
          if (index > -1) {
            locations[location].items.splice(index, 1);
          }
          console.log(`You take the ${item}.`);
        } else {
          console.log(`There is no ${item} here to take.`);
        }
        askForInput(location);
        return;
      }

      if (command.startsWith('WEAR ')) {
        const item = command.slice(5).toLowerCase();
        if (inventory.includes(item) && items[item].type === 'clothing') {
          wearing.push(item);
          const index = inventory.indexOf(item);
          if (index > -1) {
            inventory.splice(index, 1);
          }
          console.log(`You put on the ${item}.`);
        } else {
          if (!inventory.includes(item)) {
            console.log(`You don't have a ${item} in your inventory to wear.`);
          } else if (items[item].type !== 'clothing') {
            console.log(`You can't wear the ${item}.`);
          }
        }
        askForInput(location);
        return;
      }
      if (command.startsWith('EXAMINE ') || command.startsWith('X ')) {
        const item = command.startsWith('EXAMINE ')
          ? command.slice(8).toLowerCase()
          : command.slice(2).toLowerCase();
        if (
          items[item] &&
          (possessions.includes(item) ||
            locations[location].items.includes(item))
        ) {
          console.log(`You examine the ${item}. ${items[item].description}`);
        } else {
          console.log(`You don't see a ${item} here.`);
        }
        askForInput(location);
        return;
      }

      if (command.startsWith('USE ')) {
        const usePattern = /^USE\s+(.+?)\s+WITH\s+(.+)$/;
        const match = command.match(usePattern);

        if (!match) {
          console.log('Use this format: use x with y');
          askForInput(location);
          return;
        }

        const sourceItem = match[1].toLowerCase().trim();
        const targetItem = match[2].toLowerCase().trim();

        if (!possessions.includes(sourceItem)) {
          console.log(`You don't have a ${sourceItem} to use.`);
          askForInput(location);
          return;
        }

        if (
          !items[targetItem] ||
          (!inventory.includes(targetItem) &&
            !wearing.includes(targetItem) &&
            !locations[location].items.includes(targetItem) &&
            targetItem !== 'self')
        ) {
          console.log(`You can't find ${targetItem} to use it with.`);
          askForInput(location);
          return;
        }

        const useResult = items[sourceItem]?.uses?.[targetItem];
        if (useResult) {
          console.log(useResult);
        } else {
          console.log(
            `Using ${sourceItem} with ${targetItem} doesn't do anything.`
          );
        }

        askForInput(location);
        return;
      }
      console.log(
        "I don't understand. Type 'help' for a list of commands or try a different command."
      );
      askForInput(location);
      return;
    }
  );
};

const adventure = () => {
  console.log(introduction);

  askForInput('start');
};

adventure();
