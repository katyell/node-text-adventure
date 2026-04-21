import { describe, it, expect } from 'vitest'
import { handleTalkTo, handleSay } from './interaction.js'

const makeState = (overrides = {}) => ({
  location: 'start',
  output: [],
  inventory: [],
  wearing: [],
  flags: {},
  locationItems: { start: [] },
  ...overrides,
})

describe('handleTalkTo', () => {
  it('returns prompt when no noun given', () => {
    expect(handleTalkTo(makeState(), undefined).output.at(-1).text).toMatch(/talk to whom/i)
  })

  it('returns error when named npc is not in the current location', () => {
    // 'start' has npcs: [] in the real locations data
    const next = handleTalkTo(makeState({ location: 'start' }), 'merchant')
    expect(next.output.at(-1).text).toMatch(/nobody called merchant/i)
  })

  it('does not mutate original state', () => {
    const state = makeState()
    handleTalkTo(state, 'merchant')
    expect(state.output).toHaveLength(0)
  })
})

describe('handleSay', () => {
  it('returns prompt when no word given', () => {
    expect(handleSay(makeState(), undefined).output.at(-1).text).toMatch(/say what/i)
  })

  it('echoes the spoken word in output', () => {
    const next = handleSay(makeState(), 'clockwork')
    expect(next.output.at(-1).text).toMatch(/clockwork/i)
  })

  it('does not change location or inventory', () => {
    const state = makeState({ location: 'start', inventory: ['book'] })
    const next = handleSay(state, 'hello')
    expect(next.location).toBe('start')
    expect(next.inventory).toEqual(['book'])
  })

  it('does not mutate original state', () => {
    const state = makeState()
    handleSay(state, 'hello')
    expect(state.output).toHaveLength(0)
  })
})
