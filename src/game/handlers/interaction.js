import { locations } from '../../data/locations.js'
import { append } from '../stateHelpers.js'

/**
 * Talk to an NPC in the current location.
 * Full dialogue trees will be added per NPC in later issues.
 * @param {object} state
 * @param {string|undefined} noun  NPC name
 */
export function handleTalkTo(state, noun) {
  if (!noun) return append(state, 'Talk to whom?')

  const loc = locations[state.location]
  if (!loc.npcs?.includes(noun)) {
    return append(state, `There's nobody called ${noun} here.`)
  }

  return append(state, `${noun} looks at you blankly.`)
}

/**
 * Say a word or phrase aloud (used for puzzle riddles).
 * @param {object} state
 * @param {string|undefined} noun
 */
export function handleSay(state, noun) {
  if (!noun) return append(state, 'Say what?')
  return append(state, `You say "${noun}" aloud. Nothing seems to happen.`)
}
