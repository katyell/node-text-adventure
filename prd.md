# PRD: Node Text Adventure — Web Edition

## 1. Product overview

### 1.1 Document title and version

- PRD: Node Text Adventure — Web Edition
- Version: 1.0

### 1.2 Product summary

A browser-based, purely static text adventure game built with React. The player wakes up disoriented in Regency-era London (circa 1815) wearing conspicuously modern clothes. Their time machine has malfunctioned, scattering its core components across the city. To escape back to the present, the player must explore a hand-mappable grid of ~18 interconnected locations, interact with NPCs who may help or hinder them, solve item-based puzzles, and recover all the scattered components.

The game runs entirely in the browser with no backend. All game state is managed in React, and the interface mimics a classic terminal aesthetic: green text on a black background, monospace font, command-line input. There are no graphics or images. Players are encouraged to draw their own maps on paper as they explore — a deliberate design choice that makes navigation a tactile, personal part of the experience.

Save/load functionality is out of scope for this version but is acknowledged as a future iteration requiring a backend.

---

## 2. Goals

### 2.1 Business goals

- Ship a complete, playable game as a static web app deployable to any static host (GitHub Pages, Netlify, etc.)
- Establish a clean, extensible codebase that can accommodate future features (save/load, more chapters, multiplayer)
- Serve as a portfolio piece demonstrating both game design and React engineering

### 2.2 User goals

- Experience an immersive, self-contained narrative with a satisfying arc and ending
- Explore a spatially consistent map that rewards attention and hand-drawn notes
- Discover the story organically through environment descriptions and NPC dialogue
- Feel the nostalgia and challenge of classic text adventure games in a modern browser

### 2.3 Non-goals

- Save/load game state (deferred to a future backend iteration)
- Graphics, animations, or audio
- Branching dialogue trees or dialogue choices (NPCs respond to fixed commands)
- Multiplayer or shared state
- Mobile-first design (desktop terminal aesthetic is primary)

---

## 3. User personas

### 3.1 Key user types

- Casual gamer curious about the text adventure genre
- Retro gaming enthusiast familiar with Zork, Adventure, or Infocom titles
- Developer/student exploring the codebase as a learning resource

### 3.2 Basic persona details

- **The Explorer**: A player who enjoys discovery, mapping, and piecing together lore from environmental storytelling. Spends time examining every item and location before moving on.
- **The Puzzler**: Focused on solving the inventory puzzles and finding all components efficiently. May replay to find a faster route.
- **The Reader**: Drawn to the narrative and NPC dialogue. Reads all descriptions carefully and tries every conversation.

### 3.3 Role-based access

- **Player**: Full access to all game commands and locations (subject to puzzle-gated progression). No authentication required.

---

## 4. Functional requirements

- **Terminal-style UI** (Priority: High)
  - Black background, bright green monospace text (e.g. `Courier New` or `VT323` Google Font)
  - Scrollable output pane displaying the full session history
  - Single-line text input at the bottom, always focused, with a blinking cursor
  - Output auto-scrolls to the latest message on every new entry
  - The browser tab title reflects the current location name

- **Command parser** (Priority: High)
  - Accepts free-text input, normalises to uppercase, strips extra whitespace
  - Supported commands: `NORTH / N`, `SOUTH / S`, `EAST / E`, `WEST / W`, `UP / U`, `DOWN / D`, `LOOK / L`, `EXAMINE <item> / X <item>`, `TAKE <item>`, `DROP <item>`, `INVENTORY / I`, `WEAR <item>`, `TALK TO <npc>`, `USE <item> WITH <item>`, `SAY <word>`, `HELP / H`, `QUIT`
  - Unknown commands print a friendly error message with a hint to type `HELP`

- **World map** (Priority: High)
  - 18 locations arranged on a consistent cardinal grid (see section 7 narrative for the full map)
  - Every directional connection is strictly bidirectional: if location A connects NORTH to B, then B connects SOUTH to A
  - Some connections are locked until a puzzle condition is met (e.g. the iron gates are locked until a key is found)
  - Each location has: a name, a long description (shown on first visit or `LOOK`), a short description (shown on subsequent arrivals), a list of present items, a list of present NPCs, and available exits

- **Inventory system** (Priority: High)
  - Items exist in one of three states: in a location, in player inventory, or worn by player
  - `TAKE` moves an item from the current location to inventory
  - `DROP` moves an item from inventory to the current location
  - `WEAR` moves a clothing item from inventory to the worn list
  - `EXAMINE` works on items in inventory, worn, or present in the current location
  - Items have a `uses` map: `USE <source> WITH <target>` triggers a result if the combination is defined, otherwise prints a generic "nothing happens" message

- **NPC system** (Priority: High)
  - 7 NPCs, each fixed to one location
  - `TALK TO <npc>` triggers their current dialogue state
  - NPCs have conditional dialogue: their response changes after the player completes a relevant action (e.g. the Blacksmith cooperates after receiving a coin)
  - NPCs do not move or follow the player

- **Win condition** (Priority: High)
  - The player must collect all 6 time machine components and return to the start location
  - At the start location, `USE COMPONENT WITH TIME MACHINE` (or a dedicated `ASSEMBLE` command) triggers the ending sequence
  - After the ending text, all input is disabled and a "Play again?" button resets game state to initial values

- **Game state management** (Priority: High)
  - All state managed in React (a reducer is recommended): current location, inventory, worn items, item locations, NPC dialogue states, visit flags, and puzzle flags
  - No persistence between page refreshes

- **Help system** (Priority: Medium)
  - `HELP` prints a formatted list of all available commands with brief descriptions
  - First launch shows an introduction/tutorial message before the opening scene

- **Quit / reset** (Priority: Medium)
  - `QUIT` prompts confirmation, then resets all game state to initial values and replays the introduction

---

## 5. Puzzle design

All puzzles are item-based and clued exclusively through NPC dialogue and `EXAMINE` text — no puzzle requires external knowledge. Each of the six component puzzles is a multi-step chain. In addition, three optional side-puzzles reward exploration without gating progression.

### 5.1 Core puzzle principles

- **Clue before solution**: every required action is hinted at by at least one NPC line or item description before the player needs to perform it
- **No pixel-hunting**: items are listed when present in a room — nothing is hidden behind an unmarked `EXAMINE`
- **No irreversible mistakes**: a player cannot permanently lock themselves out of a component; dropped key items can always be retrieved
- **Red herrings exist**: not every item is required for a puzzle; some exist only for flavour or optional puzzles, teaching the player to experiment

### 5.2 Component puzzle chains

**Puzzle 1 — Flux crystal (Apothecary)**

The Apothecary will trade a rare ingredient for the crystal, but won't deal with a stranger who looks suspicious. The player must first earn her trust.

| Step | Action | Clue source |
|---|---|---|
| 1 | `TALK TO APOTHECARY` → she says she needs a fresh sprig of lavender and won't deal with oddly dressed strangers | Apothecary initial dialogue |
| 2 | Find the **lavender sprig** in the Park / Gardens (visible on the ground) | Park description |
| 3 | Find the **calling card** on the café table (`EXAMINE TABLE`) | Café owner idle dialogue mentions a card left by a regular |
| 4 | `USE CALLING CARD WITH APOTHECARY` → she accepts it as an introduction, dialogue state advances | Café owner says "show her something from a respectable establishment" |
| 5 | `USE LAVENDER SPRIG WITH APOTHECARY` → she hands over the **flux crystal** | Apothecary post-introduction dialogue |

*Red herring*: The apothecary's mortar and pestle can be examined but does nothing.

---

**Puzzle 2 — Copper coil (Blacksmith's forge)**

The Blacksmith needs a pair of bellows repaired before he'll help — his broken ones mean the forge won't run hot enough.

| Step | Action | Clue source |
|---|---|---|
| 1 | `TALK TO BLACKSMITH` → grumbles about broken bellows, says he needs leather and a buckle | Blacksmith initial dialogue |
| 2 | Find **worn leather** in the Cobbled Alley (an old saddlebag; `EXAMINE SADDLEBAG` yields the leather) | Alley description mentions discarded saddlery |
| 3 | Find the **brass buckle** in the Market (`USE COIN WITH MARKET STALL`) | Market description lists a haberdashery stall |
| 4 | `USE WORN LEATHER WITH BRASS BUCKLE` (both in inventory) → crafts **repaired bellows** | Blacksmith's dialogue: "just needs leather and a good buckle" |
| 5 | `USE REPAIRED BELLOWS WITH BLACKSMITH` → he fires up the forge and produces the **copper coil** | Blacksmith post-repair dialogue |

*Red herring*: There is a **horseshoe** in the forge the player can take, but it serves no required puzzle purpose.

*Coin source*: The player starts with a single modern coin in their jeans pocket, found via `EXAMINE JEANS` at game start — rewards early inventory curiosity.

---

**Puzzle 3 — Navigation compass (Library reading room)**

The Librarian has found a strange brass instrument (the compass) but won't release it without proof of scholarly credentials. She also has a missing book she's been frantic about.

| Step | Action | Clue source |
|---|---|---|
| 1 | `TALK TO LIBRARIAN` → she describes the compass as "a peculiar navigation device, not of this era" and refuses to hand it over; she also mentions her missing copy of *Principia Mathematica* | Librarian initial dialogue |
| 2 | Find **Principia Mathematica** in the Church (borrowed by the vicar, visible on the pew) | Church description; vicar NPC says "I really must return this to the library" |
| 3 | `TAKE PRINCIPIA MATHEMATICA` | — |
| 4 | `USE PRINCIPIA MATHEMATICA WITH LIBRARIAN` → she is delighted and hands over the **navigation compass** | Librarian post-book dialogue |

*Red herring*: The library contains a **star atlas** that can be examined for flavour text about 1815 astronomy but does nothing else.

---

**Puzzle 4 — Power cell (Abandoned greenhouse)**

The greenhouse is locked. The old woman in the Park found the groundskeeper's key but won't hand it over unless the player proves they know what they're looking for.

| Step | Action | Clue source |
|---|---|---|
| 1 | Approach the greenhouse → "The door is padlocked. A faded sign reads: 'Royal Botanical Society — Private'" | Greenhouse description |
| 2 | `TALK TO OLD WOMAN` in the Park → she is cryptic, asks "What grows in the dark and never needs sun?" | Old woman initial dialogue |
| 3 | `EXAMINE GREENHOUSE` from the Park → description mentions "strange glowing fungus visible through the cracked glass" | Greenhouse / Park description |
| 4 | `TALK TO OLD WOMAN` again → answer the riddle by typing `SAY FUNGUS` (introduces `SAY <word>` as a one-off command, clued in her dialogue: "just say the answer aloud") | Old woman second dialogue state |
| 5 | Old woman hands over the **groundskeeper's key** | Old woman post-riddle dialogue |
| 6 | `USE GROUNDSKEEPER'S KEY WITH GREENHOUSE DOOR` → door unlocks, greenhouse becomes accessible | — |
| 7 | `EXAMINE WORKBENCH` inside → reveals a loose floorboard; `EXAMINE FLOORBOARD` → the **power cell** is hidden beneath | Greenhouse description |

*Red herring*: A **watering can** in the greenhouse can be picked up but does nothing.

---

**Puzzle 5 — Control panel piece (Clockmaker's shop)**

The Clockmaker spotted the control panel piece fall from the sky during the crash and has been obsessively studying it. He'll only give it up to someone who clearly understands advanced timekeeping.

| Step | Action | Clue source |
|---|---|---|
| 1 | `TALK TO CLOCKMAKER` → "I've never seen a mechanism so precise — whoever made this understood time itself" | Clockmaker initial dialogue |
| 2 | `EXAMINE WRISTWATCH` (worn from the start) → a digital watch displaying the exact date and time | Item description |
| 3 | `USE WRISTWATCH WITH CLOCKMAKER` → he is astonished; the watch's precision convinces him the player is its rightful owner | Clockmaker dialogue hint: "show me something that proves you understand time" |
| 4 | He hands over the **control panel piece** and asks to sketch the watch face first — a small narrative beat | Clockmaker post-watch dialogue |

*The wristwatch is never taken from the player — it remains worn throughout.*

*Red herring*: The shop contains a **broken pocket watch** the player can take; giving it to the Blacksmith produces a comment but yields nothing.

---

**Puzzle 6 — Main chassis (Tavern cellar)**

The tavern cellar is locked. The Tavern Keeper has the key but won't share it unless the player helps him deal with a rival who has been spreading slanderous pamphlets. This is the most multi-step puzzle and is intended as the final component retrieved.

| Step | Action | Clue source |
|---|---|---|
| 1 | `TALK TO TAVERN KEEPER` → complains that a rival pub is spreading rumours about his ale; asks for help | Tavern Keeper initial dialogue |
| 2 | Find the **pamphlet** in the Market (a printed broadsheet slandering the tavern, visible on a stall) | Market description |
| 3 | `EXAMINE PAMPHLET` → reveals it was printed at the church | Pamphlet item description |
| 4 | `TALK TO VICAR` in the Church → he reluctantly admits the rival paid him to print it; `TALK TO VICAR` again → he writes a **retraction letter** | Vicar conditional dialogue (only available after the pamphlet is in inventory) |
| 5 | `USE RETRACTION LETTER WITH TAVERN KEEPER` → satisfied, he hands over the **cellar key** | Tavern Keeper post-letter dialogue |
| 6 | `USE CELLAR KEY WITH CELLAR DOOR` in the Tavern → door unlocks; Tavern Cellar accessible via `DOWN` | — |
| 7 | The **main chassis** is on a shelf in the cellar; `TAKE MAIN CHASSIS` | Cellar description |

*Red herring*: A **barrel of ale** in the cellar can be examined for flavour text.

---

### 5.3 Optional side-puzzles

These puzzles are not required to win but reward thorough exploration and add depth to the world.

**Side-puzzle A — The café secret**
- The Café Owner mentions a locked box behind the counter. `EXAMINE COUNTER` reveals it; `EXAMINE BOX` says it needs a three-digit combination.
- The combination is hinted across three fully-helped NPC idle lines (each drops a single digit as an aside after their main puzzle is resolved).
- Reward: a **journal entry** that reveals why the player originally travelled to 1815 — the only place this backstory appears.

**Side-puzzle B — The church bell**
- The Church contains a rope. `USE ROPE WITH BELL` prints an atmospheric description of the bell ringing across the city.
- After ringing the bell, the Old Woman in the Park gains a new idle dialogue line referencing the sound. Flavour only.

**Side-puzzle C — The blacksmith's horseshoe**
- After collecting the copper coil, `USE HORSESHOE WITH BLACKSMITH` → he nails it above the forge door and gives the player a **Blacksmith's token**.
- `USE BLACKSMITH'S TOKEN WITH TAVERN KEEPER` → he hangs it behind the bar and gives a short speech. Flavour only.

### 5.4 Puzzle state flags

Each puzzle step that changes the world sets a boolean flag in game state. Full flag list:

```
callingCardUsed
lavenderDelivered          → flux crystal obtained
bellowsCrafted
bellowsDelivered           → copper coil obtained
bookReturned               → navigation compass obtained
riddleAnswered
greenhouseUnlocked
powerCellFound             → power cell obtained
watchShown                 → control panel piece obtained
pamphletFound
retractionObtained
cellarUnlocked
chassisTaken               → main chassis obtained
cafeBoxSolved              → journal entry obtained (optional)
```

NPC dialogue state is derived from these flags — no separate NPC state object is needed.

---

## 6. User experience

### 6.1 Entry points & first-time user flow

- Player opens the static URL in a browser
- A brief title screen (ASCII art or styled text) displays "NODE TEXT ADVENTURE" and a "Press Enter to begin" prompt
- The introduction text plays, setting the scene (expanded from the existing intro in `text-adventure.js`)
- The command input is immediately focused and ready

### 6.2 Core experience

- **Exploration**: The player types directional commands to move between locations. Each new location prints its description and lists visible items and NPCs. Returning to a visited location prints the short description.
- **Mapping**: Descriptions are deliberately written to reinforce spatial orientation (e.g. "The street runs east to west. To the north, a café."). Players are expected to sketch a map on paper — no in-game map is provided.
- **Investigation**: `EXAMINE` reveals deeper lore and puzzle hints. Items have flavour text that rewards curiosity without being required for progression.
- **NPC interaction**: `TALK TO <npc>` yields story context and hints. Some NPCs require an item before they will help. Repeated `TALK TO` cycles through idle dialogue lines.
- **Puzzle solving**: Each component requires a multi-step chain (full details in section 5). The general pattern is: talk to an NPC for the clue → find and combine items → deliver or use them → receive the component. Three optional side-puzzles exist for players who explore thoroughly.
- **Endgame**: Collecting the final component and assembling the time machine triggers the multi-paragraph ending sequence. The story resolves and credits the player.

### 6.3 Advanced features & edge cases

- Attempting to move in a direction with no exit prints "You can't go that way."
- Attempting to move through a locked exit prints a specific contextual message (e.g. "The iron gates are locked. You need a key.")
- `TAKE` on an item not in the room prints "You don't see that here."
- `EXAMINE` on something not present prints "You don't see that here."
- `TALK TO` on an NPC not in the current location prints "There's nobody called that here."
- Using a key item combination in the wrong order prints a specific near-miss message rather than the generic fallback
- The player can DROP components they've collected; location descriptions note the dropped item if present, reminding the player it is there

### 6.4 UI/UX highlights

- The input field is never unfocused — clicking anywhere on the page re-focuses it
- Typed commands echo back in the output pane in a distinct colour (dimmer green or white) to distinguish input from output
- A subtle scanline CSS effect reinforces the CRT/terminal aesthetic
- The layout is fixed-height viewport: output pane scrolls internally; input bar is always pinned to the bottom
- Font: `VT323` (Google Fonts) at 18–20px for retro feel, fallback to `Courier New`

---

## 7. Narrative

*The story: "Lost in the Regency"*

You are a time traveller — your name, your mission, even your origin are things you're still piecing together. You wake up face-down on a cobblestone street in London, 1815, wearing a green t-shirt and jeans that draw stares from every passing gentleman. Your time machine — a battered brass-and-circuit-board contraption — is gone. Worse, six of its core components have been scattered across the city, likely lost in the crash. The city is alive with characters: a suspicious apothecary, a garrulous café owner, a world-weary blacksmith, a librarian who guards her books like a dragon guards gold, a clockmaker entranced by your wristwatch, a gossiping tavern keeper, and a mysterious old woman in the park who seems to know far too much. Every conversation is a clue. Every item is a potential key. Find the components. Rebuild the machine. Get home — and along the way, uncover why you came here in the first place.

**The six time machine components and their locations:**

| # | Component | Puzzle summary | Location |
|---|---|---|---|
| 1 | Flux crystal | Earn the Apothecary's trust (calling card), then trade lavender for the crystal | Apothecary |
| 2 | Copper coil | Craft repaired bellows (leather + buckle) and give them to the Blacksmith | Blacksmith's forge |
| 3 | Navigation compass | Return the Librarian's missing *Principia Mathematica* (found in the Church) | Library reading room |
| 4 | Power cell | Solve the Old Woman's riddle → get greenhouse key → find the hidden floorboard | Abandoned greenhouse |
| 5 | Control panel piece | Show your digital wristwatch to the Clockmaker | Clockmaker's shop |
| 6 | Main chassis | Help the Tavern Keeper discredit the pamphlet (via the Vicar) → get cellar key | Tavern cellar |

Full step-by-step chains are documented in section 5.

**The map (18 locations):**

```
[Church]        [Library]      [Apothecary]
    |                |                |
[Clockmaker]  [Town Square]      [Café]
    |                |                |
[Tavern]         [Market]      [Cobbled Alley]
    |                |                |
[Tavern Cellar] [Iron Gates]  [Blacksmith's Forge]
                     |
               [Park / Gardens]
                     |
           [Abandoned Greenhouse]
```

All horizontal and vertical connections are bidirectional. The Tavern Cellar connects UP/DOWN from the Tavern. The Iron Gates are locked until the player obtains the groundskeeper's key (found in the Park via the old woman NPC).

---

## 8. Success metrics

### 8.1 User-centric metrics

- Players reach the win condition (all components collected, ending triggered)
- Players interact with all 7 NPCs at least once per session
- Players use `EXAMINE` on at least 50% of available items (proxy for engagement depth)

### 8.2 Business metrics

- Game is fully playable end-to-end with no softlock states
- All 18 locations are reachable and all exits are verified bidirectional
- Zero console errors in the production build

### 8.3 Technical metrics

- Initial page load under 2 seconds on a standard connection (static assets only)
- React bundle size under 200 KB gzipped
- Game state transitions complete within a single render frame (no perceptible input lag)

---

## 9. Technical considerations

### 9.1 Integration points

- Static hosting: GitHub Pages or Netlify (no server required)
- Google Fonts: `VT323` loaded via `<link>` in `index.html`
- Build tool: Vite (fast dev server, optimised static output)
- No external APIs, no backend, no authentication

### 9.2 Data storage & privacy

- No user data is collected or stored
- All game state lives in React memory and resets on page refresh
- No cookies, analytics, or tracking in v1

### 9.3 Scalability & performance

- All game data (locations, items, NPCs, dialogue) defined as plain JS/TS constant objects — easy to extend without touching game logic
- Game logic fully decoupled from UI components to allow future extraction into a shared module
- Save/load can be added in v2 by serialising the state object to `localStorage` (no backend required) or to a REST/GraphQL API (with backend)

### 9.4 Potential challenges

- **Parser ambiguity**: Partial or misspelled commands need graceful fallback messages; consider fuzzy matching for common mistakes in a future iteration
- **Softlocks**: Any droppable puzzle item could strand the player if dropped unreachably — all key items should print a warning when dropped ("You have a feeling you should hold on to this")
- **Map integrity**: Asymmetric exits are easy to introduce by mistake and immediately break spatial trust — implement an automated integrity check (unit test or script) that verifies every exit has a reciprocal
- **Narrative pacing**: Descriptions must be vivid but concise (2–4 sentences max per location) to avoid the output pane feeling like a wall of text

---

## 10. Milestones & sequencing

### 10.1 Project estimate

- Medium: 4–6 weeks (solo developer, part-time)

### 10.2 Team size & composition

- Solo: 1 developer / designer / writer

### 10.3 Suggested phases

- **Phase 1 — Foundation** (Week 1)
  - Scaffold React + Vite project
  - Build terminal UI shell: output pane, input bar, CRT styling, fonts
  - Port existing `text-adventure.js` game logic into a React reducer
  - Implement core command parser

- **Phase 2 — World building** (Weeks 2–3)
  - Define all 18 locations with long/short descriptions, exits, and item lists
  - Implement the full bidirectional map with locked-exit flag system
  - Define all items with descriptions and `uses` map
  - Write and implement all 7 NPC dialogue states (initial, post-interaction, idle ×2)
  - Write a map integrity check test

- **Phase 3 — Story & puzzles** (Weeks 3–4)
  - Implement all 6 component puzzles end-to-end
  - Implement win condition and ending sequence
  - Write introduction, mid-game story beats, and ending text
  - Full playthrough test; fix any softlocks or parser gaps

- **Phase 4 — Polish & ship** (Weeks 5–6)
  - Scanline CRT effect, blinking cursor, command echo colour
  - Cross-browser testing (Chrome, Firefox, Safari)
  - Deploy to GitHub Pages or Netlify
  - Write `README.md` with play instructions and command reference

---

## 11. User stories

### 11.1. Start the game

- **ID**: TA-001
- **Description**: As a player, I want to open the game in my browser and see an introduction that sets the scene, so I understand the story premise before I start playing.
- **Acceptance criteria**:
  - A title screen displays on load with the game name
  - Pressing Enter starts the game and prints the introduction text
  - After the introduction, the current location description and available exits are shown
  - The command input is focused and ready

### 11.2. Navigate the map

- **ID**: TA-002
- **Description**: As a player, I want to move between locations using cardinal direction commands, so I can explore the world and build my own map.
- **Acceptance criteria**:
  - `NORTH`, `N`, `SOUTH`, `S`, `EAST`, `E`, `WEST`, `W`, `UP`, `U`, `DOWN`, `D` move the player if the exit exists
  - Moving to a new (unvisited) location prints the long description and lists visible items and NPCs
  - Returning to a previously visited location prints the short description
  - Every connection is strictly bidirectional
  - Moving in a direction with no exit prints "You can't go that way."
  - Moving through a locked exit prints a specific contextual locked message

### 11.3. Examine items and surroundings

- **ID**: TA-003
- **Description**: As a player, I want to examine items and my surroundings, so I can discover clues and understand the world.
- **Acceptance criteria**:
  - `LOOK` / `L` prints the current location's long description and lists visible items and NPCs
  - `EXAMINE <item>` / `X <item>` prints the item's description if it is in the room, in inventory, or worn
  - `EXAMINE <npc>` prints a brief visual description of the NPC
  - Examining something not present prints "You don't see that here."

### 11.4. Manage inventory

- **ID**: TA-004
- **Description**: As a player, I want to pick up, drop, and wear items, so I can carry what I need and manage my belongings.
- **Acceptance criteria**:
  - `TAKE <item>` moves an item from the current room to inventory and confirms
  - `DROP <item>` moves an item from inventory to the current room and confirms
  - Key puzzle items print a warning when dropped
  - `WEAR <item>` moves a clothing item from inventory to the worn list and confirms
  - `INVENTORY` / `I` lists all items in inventory and all items being worn
  - `TAKE` on an absent item prints "You don't see that here."
  - `WEAR` on a non-clothing item prints an appropriate refusal

### 11.5. Use items together

- **ID**: TA-005
- **Description**: As a player, I want to use one item with another, so I can solve puzzles and progress the story.
- **Acceptance criteria**:
  - `USE <item> WITH <item>` checks if the combination is valid and prints the defined result
  - An undefined combination prints "That doesn't seem to do anything."
  - Source item must be in inventory or worn; target item must be in inventory, worn, or present in the room
  - Successful use interactions update the relevant game state (unlock a door, change NPC dialogue, yield a new item)
  - Key puzzle combinations used in the wrong order print a specific near-miss message

### 11.6. Talk to NPCs

- **ID**: TA-006
- **Description**: As a player, I want to talk to NPCs, so I can gather story information, hints, and unlock puzzle progressions.
- **Acceptance criteria**:
  - `TALK TO <npc>` prints the NPC's current dialogue if they are present
  - NPC dialogue changes after the player completes a relevant action
  - Repeating `TALK TO` on an NPC with nothing new cycles through 2–3 idle lines
  - Talking to an absent NPC prints "There's nobody called that here."
  - All 7 NPCs have at least 3 dialogue states: initial, post-interaction, and idle

### 11.7. Get help

- **ID**: TA-007
- **Description**: As a player, I want to see a list of available commands at any time, so I know how to interact with the game.
- **Acceptance criteria**:
  - `HELP` / `H` prints a formatted list of all commands with brief descriptions
  - The help output is visually distinct from regular game output
  - Unknown commands print a short error that suggests typing `HELP`

### 11.8. Complete the game

- **ID**: TA-008
- **Description**: As a player, I want to collect all 6 time machine components and assemble the machine at the start location, so I can experience the story's conclusion.
- **Acceptance criteria**:
  - All 6 components are obtainable, each requiring at least one puzzle step
  - Attempting to assemble with fewer than 6 components prints a message listing what is still missing
  - Assembling with all 6 components present triggers the multi-paragraph ending sequence
  - After the ending, all command input is disabled
  - A "Play again?" button appears and resets all state to initial values

### 11.9. Solve puzzles to collect components

- **ID**: TA-012
- **Description**: As a player, I want each time machine component to require a multi-step puzzle to obtain, so the game feels challenging and rewarding.
- **Acceptance criteria**:
  - All 6 components require at least 2 steps to obtain (no single `TAKE`)
  - Every required action is clued by at least one NPC line or `EXAMINE` result before the player needs to perform it
  - No puzzle can be rendered unsolvable by a prior player action (no softlocks)
  - Key puzzle items print a warning message if the player tries to drop them
  - Using a valid item combination in the wrong order prints a specific near-miss message, not the generic fallback
  - The `SAY <word>` command works in at least one puzzle context (the Old Woman's riddle) and is explained in `HELP`

### 11.10. Discover optional side-puzzles

- **ID**: TA-013
- **Description**: As a player who explores thoroughly, I want to find optional puzzles that reveal extra story content, so I am rewarded for curiosity beyond the critical path.
- **Acceptance criteria**:
  - The café combination box is discoverable via `EXAMINE COUNTER` without any NPC directing the player there
  - Solving the café box puzzle unlocks the journal entry (backstory text)
  - The church bell and blacksmith's horseshoe interactions are functional and print unique flavour text
  - None of the optional puzzles are required for the win condition

### 11.11. Explore the full map without guidance

- **ID**: TA-009
- **Description**: As a player, I want to discover all 18 locations through exploration with no in-game map, so I can enjoy hand-drawing my own map as part of the experience.
- **Acceptance criteria**:
  - All 18 locations are reachable from the start location without softlocking
  - Each location description clearly states which directions are available
  - No exits are hidden; locked exits are visible but impassable until unlocked
  - The spatial layout is geographically consistent (going north then south returns to the same place)

### 11.12. Quit and restart

- **ID**: TA-010
- **Description**: As a player, I want to quit the current session and start over, so I can replay or recover from a bad state.
- **Acceptance criteria**:
  - `QUIT` prints a confirmation prompt
  - Confirming resets all game state and replays the introduction
  - Cancelling returns the player to their current state unchanged

### 11.13. Experience the terminal aesthetic

- **ID**: TA-011
- **Description**: As a player, I want the game to look and feel like a classic CRT terminal, so the presentation enhances the retro atmosphere.
- **Acceptance criteria**:
  - Background is black; primary output text is green; typed commands echo in a distinct colour
  - Font is `VT323` (fallback `Courier New`), 18–20px
  - A subtle scanline or CRT CSS effect is applied to the output pane
  - The cursor in the input field blinks
  - Clicking anywhere on the page re-focuses the input field
  - The output pane auto-scrolls to the latest line after every command
  - The layout fills the full viewport; the output pane scrolls internally with no external scrollbar
