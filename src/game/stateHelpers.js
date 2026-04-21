import { locations } from '../data/locations.js'

/**
 * Append one or more output lines to state, returning a new state object.
 * @param {object} state
 * @param {...string} lines
 */
export function append(state, ...lines) {
  return {
    ...state,
    output: [
      ...state.output,
      ...lines.map((text) => ({ type: 'output', text })),
    ],
  }
}

/**
 * Returns a Set of all item ids the player currently has access to
 * (carrying, wearing, or the fixed 'self' pseudo-item).
 * @param {object} state
 * @returns {Set<string>}
 */
export function possessions(state) {
  return new Set(['self', ...state.wearing, ...state.inventory])
}

/**
 * Build an array of output lines describing a location.
 * Shows the full description on first visit (or when forceLong is true),
 * otherwise shows the short description.
 * @param {object} state
 * @param {string} locationId
 * @param {boolean} [forceLong=false]
 * @returns {string[]}
 */
export function locationLines(state, locationId, forceLong = false) {
  const loc = locations[locationId]
  const locItems = state.locationItems[locationId] ?? []
  const lines = []

  if (!state.visited[locationId] || forceLong) {
    lines.push(`--- ${loc.name.toUpperCase()} ---`)
    lines.push(loc.description)
  } else {
    lines.push(loc.shortDescription)
  }

  if (locItems.length > 0) {
    lines.push(`You can see: ${locItems.join(', ')}.`)
  }

  if (loc.npcs && loc.npcs.length > 0) {
    lines.push(
      `${loc.npcs.join(' and ')} ${loc.npcs.length === 1 ? 'is' : 'are'} here.`
    )
  }

  const exits = Object.keys(loc.exits)
  lines.push(`Exits: ${exits.join(', ')}.`)

  return lines
}
