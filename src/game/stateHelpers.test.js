import { describe, it, expect } from 'vitest'
import { append, possessions, locationLines } from './stateHelpers.js'

// Minimal state fixture — avoids importing real game data in helper tests
const baseState = {
  output: [],
  inventory: [],
  wearing: [],
  visited: {},
  locationItems: { start: [], cafe: ['coffee cup'] },
  flags: {},
}

describe('append', () => {
  it('adds a single output line', () => {
    const next = append(baseState, 'Hello')
    expect(next.output).toHaveLength(1)
    expect(next.output[0]).toEqual({ type: 'output', text: 'Hello' })
  })

  it('adds multiple lines in order', () => {
    const next = append(baseState, 'Line 1', 'Line 2', 'Line 3')
    expect(next.output.map((l) => l.text)).toEqual(['Line 1', 'Line 2', 'Line 3'])
  })

  it('appends to existing output rather than replacing it', () => {
    const state = { ...baseState, output: [{ type: 'output', text: 'Existing' }] }
    const next = append(state, 'New')
    expect(next.output).toHaveLength(2)
    expect(next.output[0].text).toBe('Existing')
    expect(next.output[1].text).toBe('New')
  })

  it('does not mutate the original state', () => {
    const state = { ...baseState, output: [] }
    append(state, 'Hello')
    expect(state.output).toHaveLength(0)
  })

  it('tags all appended lines as type "output"', () => {
    const next = append(baseState, 'a', 'b')
    expect(next.output.every((l) => l.type === 'output')).toBe(true)
  })

  it('preserves unrelated state keys', () => {
    const state = { ...baseState, location: 'start', inventory: ['book'] }
    const next = append(state, 'Hello')
    expect(next.location).toBe('start')
    expect(next.inventory).toEqual(['book'])
  })
})

describe('possessions', () => {
  it('always includes "self"', () => {
    expect(possessions(baseState).has('self')).toBe(true)
  })

  it('includes worn items', () => {
    const state = { ...baseState, wearing: ['tshirt', 'jeans'] }
    const p = possessions(state)
    expect(p.has('tshirt')).toBe(true)
    expect(p.has('jeans')).toBe(true)
  })

  it('includes carried items', () => {
    const state = { ...baseState, inventory: ['book'] }
    expect(possessions(state).has('book')).toBe(true)
  })

  it('does not include items from other locations', () => {
    const state = { ...baseState, inventory: [], wearing: [] }
    expect(possessions(state).has('coffee cup')).toBe(false)
  })

  it('returns a Set (no duplicates)', () => {
    const state = { ...baseState, wearing: ['tshirt'], inventory: ['tshirt'] }
    expect(possessions(state).size).toBe(2) // 'self' + 'tshirt'
  })
})

describe('locationLines', () => {
  // Use real locations data for this helper since it is tightly coupled
  it('includes the location name header on first visit', async () => {
    const { locations } = await import('../data/locations.js')
    const state = { ...baseState, visited: {}, locationItems: { start: [] } }
    const lines = locationLines(state, 'start')
    expect(lines[0]).toMatch(/COBBLED STREET/i)
  })

  it('shows long description on first visit', async () => {
    const { locations } = await import('../data/locations.js')
    const state = { ...baseState, visited: {}, locationItems: { start: [] } }
    const lines = locationLines(state, 'start')
    expect(lines[1]).toBe(locations.start.description)
  })

  it('shows short description on return visit', async () => {
    const { locations } = await import('../data/locations.js')
    const state = { ...baseState, visited: { start: true }, locationItems: { start: [] } }
    const lines = locationLines(state, 'start')
    expect(lines[0]).toBe(locations.start.shortDescription)
  })

  it('forces long description when forceLong is true even if already visited', async () => {
    const { locations } = await import('../data/locations.js')
    const state = { ...baseState, visited: { start: true }, locationItems: { start: [] } }
    const lines = locationLines(state, 'start', true)
    expect(lines[1]).toBe(locations.start.description)
  })

  it('lists items present in the room', async () => {
    const state = {
      ...baseState,
      visited: {},
      locationItems: { cafe: ['coffee cup', 'book'] },
    }
    const lines = locationLines(state, 'cafe')
    expect(lines.some((l) => l.includes('coffee cup'))).toBe(true)
    expect(lines.some((l) => l.includes('book'))).toBe(true)
  })

  it('omits items line when room is empty', async () => {
    const state = { ...baseState, visited: {}, locationItems: { start: [] } }
    const lines = locationLines(state, 'start')
    expect(lines.some((l) => l.startsWith('You can see:'))).toBe(false)
  })

  it('always ends with an exits line', async () => {
    const state = { ...baseState, visited: {}, locationItems: { start: [] } }
    const lines = locationLines(state, 'start')
    expect(lines.at(-1)).toMatch(/^Exits:/)
  })
})
